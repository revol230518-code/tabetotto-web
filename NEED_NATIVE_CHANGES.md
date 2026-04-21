
# Android Native 変更手順書

本プロジェクトでは、一部のネイティブ機能（画像保存など）を利用するため、`npx cap add android` で生成したあとに、以下の手動設定が必要です。

## 1. GallerySaverPlugin.kt の配置

同梱されている `native_changes/GallerySaverPlugin.kt` を、生成された Android プロジェクトの適切なパッケージディレクトリにコピーしてください。

**コピー元:**
`native_changes/GallerySaverPlugin.kt`

**コピー先:**
`android/app/src/main/java/com/revo/tabetotto/GallerySaverPlugin.kt`
*(※ パッケージ名 `com.revo.tabetotto` の部分は、ご自身の環境に合わせて適宜フォルダを作成・変更してください)*

## 2. MainActivity.java へのプラグイン登録

`android/app/src/main/java/com/revo/tabetotto/MainActivity.java` を開き、`GallerySaverPlugin` を登録してください。

```java
package com.revo.tabetotto;

import android.os.Bundle; // 追加
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // プラグイン登録を追加
        registerPlugin(GallerySaverPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
```

## 3. AndroidManifest.xml への権限追加

`android/app/src/main/AndroidManifest.xml` を開き、以下の権限を追加してください。
（`<manifest>`タグの直下、`<application>`タグの前に追加）

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.revo.tabetotto">

    <!-- 1. ギャラリー保存用 (Android 9以下向け) -->
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />

    <!-- 2. AdMob用 (Android 13以降必須) -->
    <uses-permission android:name="com.google.android.gms.permission.AD_ID"/>

    <application ...>
        ...
    </application>
</manifest>
```

**解説:**
- `WRITE_EXTERNAL_STORAGE`: Android 9以下の端末で画像を保存するために必要です。
- `AD_ID`: Android 13以降でAdMob広告を適切に配信するために必須です。これがないと広告IDが取得できず、収益に悪影響が出ます。

## 4. アプリケーションID (AdMob) の確認

`AndroidManifest.xml` の `<application>` タグ内に、AdMobの `APPLICATION_ID` が正しく設定されているか確認してください。

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3081007845343649~1937834329"/>
```
