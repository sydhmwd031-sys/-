package com.fajr.alarm

import android.Manifest
import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.NotificationManager
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.location.Geocoder
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Looper
import android.os.PowerManager
import android.provider.Settings
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import org.json.JSONObject
import java.util.Locale

/** نشاط فيه واجهة التطبيق (HTML محلي) وجسر للأندرويد. */
open class ShellActivity : ComponentActivity() {

    protected lateinit var web: WebView
    private var pendingSlot: String? = null
    private var pendingCam: PermissionRequest? = null

    private val soundPicker = registerForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        val slot = pendingSlot; pendingSlot = null
        if (uri != null && slot != null) {
            Thread {
                val name = SoundStore.save(this, slot, uri)
                runOnUiThread {
                    if (name != null) js("window.onSoundPicked && window.onSoundPicked(${q(slot)}, ${q(name)})")
                }
            }.start()
        }
    }
    private val camPerm = registerForActivityResult(ActivityResultContracts.RequestPermission()) { ok ->
        val r = pendingCam; pendingCam = null
        if (r != null) { if (ok) r.grant(r.resources) else r.deny() }
        js("window.onPermsChanged && window.onPermsChanged()")
    }
    private val notifPerm = registerForActivityResult(ActivityResultContracts.RequestPermission()) {
        js("window.onPermsChanged && window.onPermsChanged()")
    }
    private val locPerm = registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { res ->
        if (res.values.any { it }) fetchLocation() else js("window.onNativeLocation && window.onNativeLocation(null)")
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.parseColor("#0c1230")
        window.navigationBarColor = Color.parseColor("#141b40")
    }

    @SuppressLint("SetJavaScriptEnabled")
    protected fun setupWeb(page: String) {
        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
        web = WebView(this)
        web.setBackgroundColor(Color.parseColor("#0c1230"))
        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = false
            allowContentAccess = false
            textZoom = 100
        }
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse? =
                loader.shouldInterceptRequest(request.url)

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val u = request.url
                if (u.host == "appassets.androidplatform.net") return false
                openUrl(u.toString()); return true
            }
        }
        web.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest) {
                if (PermissionRequest.RESOURCE_VIDEO_CAPTURE !in request.resources) { request.deny(); return }
                if (has(Manifest.permission.CAMERA)) request.grant(arrayOf(PermissionRequest.RESOURCE_VIDEO_CAPTURE))
                else { pendingCam = request; camPerm.launch(Manifest.permission.CAMERA) }
            }
        }
        web.addJavascriptInterface(Bridge(), "Android")
        setContentView(web)
        web.loadUrl("https://appassets.androidplatform.net/assets/www/$page")
    }

    override fun onResume() {
        super.onResume()
        if (::web.isInitialized) js("window.onPermsChanged && window.onPermsChanged()")
    }

    fun js(code: String) { if (::web.isInitialized) web.post { web.evaluateJavascript(code, null) } }
    private fun q(s: String) = JSONObject.quote(s)
    private fun has(p: String) = ContextCompat.checkSelfPermission(this, p) == PackageManager.PERMISSION_GRANTED

    fun openUrl(u: String) {
        try { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(u))) } catch (_: Exception) { }
    }

    // ---------- الصلاحيات ----------
    fun permJson(): String {
        val o = JSONObject()
        o.put("notif", Build.VERSION.SDK_INT < 33 || has(Manifest.permission.POST_NOTIFICATIONS))
        val am = getSystemService(AlarmManager::class.java)
        o.put("exact", Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms())
        val nm = getSystemService(NotificationManager::class.java)
        o.put("full", Build.VERSION.SDK_INT < 34 || nm.canUseFullScreenIntent())
        o.put("battery", getSystemService(PowerManager::class.java).isIgnoringBatteryOptimizations(packageName))
        o.put("camera", has(Manifest.permission.CAMERA))
        return o.toString()
    }

    @SuppressLint("BatteryLife", "InlinedApi")
    fun fixPerm(which: String) {
        val pkg = Uri.parse("package:$packageName")
        try {
            when (which) {
                "notif" -> if (Build.VERSION.SDK_INT >= 33) notifPerm.launch(Manifest.permission.POST_NOTIFICATIONS)
                "exact" -> if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S)
                    startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, pkg))
                "full" -> if (Build.VERSION.SDK_INT >= 34)
                    startActivity(Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT, pkg))
                "battery" -> startActivity(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, pkg))
                "camera" -> if (!has(Manifest.permission.CAMERA)) camPerm.launch(Manifest.permission.CAMERA)
            }
        } catch (e: Exception) {
            startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, pkg))
        }
    }

    // ---------- الموقع ----------
    fun requestLocation() {
        if (has(Manifest.permission.ACCESS_FINE_LOCATION) || has(Manifest.permission.ACCESS_COARSE_LOCATION)) fetchLocation()
        else locPerm.launch(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION))
    }

    @SuppressLint("MissingPermission")
    private fun fetchLocation() {
        val lm = getSystemService(LocationManager::class.java)
        val providers = listOf(LocationManager.NETWORK_PROVIDER, LocationManager.GPS_PROVIDER).filter {
            try { lm.isProviderEnabled(it) } catch (e: Exception) { false }
        }
        val last = providers.mapNotNull { try { lm.getLastKnownLocation(it) } catch (e: Exception) { null } }
            .maxByOrNull { it.time }
        if (providers.isEmpty()) { deliver(last); return }
        val p = providers.first()
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                lm.getCurrentLocation(p, null, mainExecutor) { loc -> deliver(loc ?: last) }
            } else {
                @Suppress("DEPRECATION")
                lm.requestSingleUpdate(p, object : LocationListener {
                    override fun onLocationChanged(location: Location) { deliver(location) }
                    @Deprecated("") override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
                    override fun onProviderEnabled(provider: String) {}
                    override fun onProviderDisabled(provider: String) {}
                }, Looper.getMainLooper())
            }
        } catch (e: Exception) { deliver(last) }
    }

    private fun deliver(loc: Location?) {
        if (loc == null) { js("window.onNativeLocation && window.onNativeLocation(null)"); return }
        Thread {
            // اسم المدينة من الإنترنت (Geocoder)
            var city = ""
            try {
                @Suppress("DEPRECATION")
                val a = Geocoder(this, Locale.forLanguageTag("ar")).getFromLocation(loc.latitude, loc.longitude, 1)?.firstOrNull()
                city = a?.locality ?: a?.subAdminArea ?: a?.adminArea ?: ""
            } catch (_: Exception) { }
            js("window.onNativeLocation && window.onNativeLocation({lat:${loc.latitude},lng:${loc.longitude},city:${q(city)}})")
        }.start()
    }

    // ---------- الجسر ----------
    inner class Bridge {
        @JavascriptInterface fun isNative(): Boolean = true

        @JavascriptInterface fun saveSchedule(events: String, config: String) {
            val p = Prefs(this@ShellActivity); p.events = events; p.config = config
            Scheduler.scheduleNext(this@ShellActivity)
        }

        @JavascriptInterface fun listSounds(): String = SoundStore.list(this@ShellActivity)
        @JavascriptInterface fun pickSound(slot: String) = runOnUiThread {
            pendingSlot = slot
            soundPicker.launch(arrayOf("audio/*"))
        }
        @JavascriptInterface fun downloadSound(slot: String, url: String, name: String) {
            Thread {
                val ok = SoundStore.download(this@ShellActivity, slot, url, name)
                js(if (ok) "window.onSoundPicked && window.onSoundPicked(${q(slot)}, ${q(name)})"
                   else "window.onSoundFailed && window.onSoundFailed(${q(slot)})")
            }.start()
        }
        @JavascriptInterface fun deleteSound(slot: String) = SoundStore.delete(this@ShellActivity, slot)
        @JavascriptInterface fun previewSound(slot: String) = runOnUiThread {
            SoundStore.preview(this@ShellActivity, slot) { js("window.onPreviewEnded && window.onPreviewEnded()") }
        }
        @JavascriptInterface fun stopPreview() = runOnUiThread { SoundStore.stopPreview() }

        @JavascriptInterface fun requestLocation() = runOnUiThread { this@ShellActivity.requestLocation() }
        @JavascriptInterface fun permStatus(): String = permJson()
        @JavascriptInterface fun fixPerm(which: String) = runOnUiThread { this@ShellActivity.fixPerm(which) }

        @JavascriptInterface fun testAlarm() {
            ContextCompat.startForegroundService(
                this@ShellActivity, Intent(this@ShellActivity, AlarmService::class.java).putExtra("type", "alarm")
            )
        }
        @JavascriptInterface fun stopAlarm() {
            startService(Intent(this@ShellActivity, AlarmService::class.java).putExtra("type", "stop"))
        }
        @JavascriptInterface fun finishScreen() = runOnUiThread { finish() }
        @JavascriptInterface fun openUrl(u: String) = runOnUiThread { this@ShellActivity.openUrl(u) }
    }
}
