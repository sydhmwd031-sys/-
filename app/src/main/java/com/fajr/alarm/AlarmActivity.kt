package com.fajr.alarm

import android.os.Build
import android.os.Bundle
import android.view.KeyEvent
import android.view.WindowManager
import androidx.activity.OnBackPressedCallback

/** شاشة المنبه: تطلع فوق شاشة القفل، وما تقفل بزر الرجوع. */
class AlarmActivity : ShellActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON)
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // ما فيه رجوع: لازم الباركود أو زر الطوارئ
                if (!Prefs(this@AlarmActivity).ringing) finish()
            }
        })
        setupWeb("index.html?mode=ring")
    }

    /** أزرار الصوت ما تشتغل والمنبه يرن. */
    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        val volumeKey = event.keyCode == KeyEvent.KEYCODE_VOLUME_DOWN || event.keyCode == KeyEvent.KEYCODE_VOLUME_UP ||
            event.keyCode == KeyEvent.KEYCODE_VOLUME_MUTE
        if (volumeKey && Prefs(this).ringing) {
            if (event.action == KeyEvent.ACTION_DOWN && event.repeatCount == 0) {
                js("window.toast && toast('الصوت مقفل لين توقف المنبه')")
            }
            return true
        }
        return super.dispatchKeyEvent(event)
    }
}
