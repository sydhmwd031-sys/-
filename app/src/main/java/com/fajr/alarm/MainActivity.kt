package com.fajr.alarm

import android.content.Intent
import android.os.Bundle
import androidx.activity.OnBackPressedCallback

class MainActivity : ShellActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setupWeb("index.html")
        // زر الرجوع يقفل المصحف أو النوافذ أولاً قبل ما يطلع من التطبيق
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                web.evaluateJavascript("window.onBack ? window.onBack() : false") { r ->
                    if (r != "true") finish()
                }
            }
        })
        // لو المنبه يرن والمستخدم فتح التطبيق، نوديه لشاشة المنبه
        if (Prefs(this).ringing && AlarmService.isAlarmRunning) {
            startActivity(Intent(this, AlarmActivity::class.java))
        }
    }

    override fun onDestroy() {
        SoundStore.stopPreview()
        super.onDestroy()
    }
}
