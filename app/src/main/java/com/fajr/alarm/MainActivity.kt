package com.fajr.alarm

import android.os.Bundle

class MainActivity : ShellActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setupWeb("index.html")
        // لو المنبه يرن والمستخدم فتح التطبيق، نوديه لشاشة المنبه
        if (Prefs(this).ringing && AlarmService.isAlarmRunning) {
            startActivity(android.content.Intent(this, AlarmActivity::class.java))
        }
    }

    override fun onDestroy() {
        SoundStore.stopPreview()
        super.onDestroy()
    }
}
