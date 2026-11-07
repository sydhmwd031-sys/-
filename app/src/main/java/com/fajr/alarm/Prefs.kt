package com.fajr.alarm

import android.content.Context
import org.json.JSONObject

/** الإعدادات اللي تحتاجها الخدمة والمنبه والتطبيق مسكّر. */
class Prefs(ctx: Context) {
    private val p = ctx.applicationContext.getSharedPreferences("fajr", Context.MODE_PRIVATE)

    var events: String
        get() = p.getString("events", "[]") ?: "[]"
        set(v) = p.edit().putString("events", v).apply()

    var config: String
        get() = p.getString("config", "{}") ?: "{}"
        set(v) = p.edit().putString("config", v).apply()

    var ringing: Boolean
        get() = p.getBoolean("ringing", false)
        set(v) = p.edit().putBoolean("ringing", v).commit().let { }

    var soundNames: String
        get() = p.getString("soundNames", "{}") ?: "{}"
        set(v) = p.edit().putString("soundNames", v).apply()

    fun configJson(): JSONObject = try { JSONObject(config) } catch (e: Exception) { JSONObject() }
}
