plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.fajr.alarm"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.fajr.alarm"
        minSdk = 26
        targetSdk = 34
        versionCode = 6
        versionName = "4.2"
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            // للتجربة نوقّع نسخة الإصدار بمفتاح التطوير. للنشر في المتجر استبدله بمفتاحك.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.webkit:webkit:1.12.1")
}
