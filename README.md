# たべとっと。 WEB v1.0 Release READY

## 1. プロジェクト概要
- **アプリ名**: たべとっと。 (WEB版)
- **目的**: 姿勢と食事のAI解析ダイエットアシスタント
- **技術基盤**: React + TypeScript + Vite + Capacitor + PWA
- **リリースフェーズ**: Phase 5 (公開前総点検完了)

## 2. 公開前最終チェックリスト (実機確認項目)
公開直前に以下の項目を実機（iOS/Android）で確認してください。

### PWA / ブラウザ挙動
- [ ] **ホーム画面追加**: Chrome(Android)/Safari(iOS)で追加が可能か、追加後にスプラッシュ画面が表示されるか。
- [ ] **オフライン動作**: 通信を切った状態でアプリが起動し、静的ページ（FAQ等）が閲覧可能か。
- [ ] **LocalStorage**: 一度記録した内容が、ブラウザの再読み込み後も残っているか。

### カメラ / 解析
- [ ] **カメラ権限**: 初回起動時にカメラ権限が求められ、許可/拒否が正しく動作するか。
- [ ] **拒否時の動作**: カメラを拒否しても、アルバムから写真を選択できるか、アプリがフリーズしないか。
- [ ] **AI解析**: Cloud Run 経由で Gemini による解析結果が正しく戻ってくるか。

### 広告 (AdSense審査用)
- [ ] **静的ページ**: プライバシーポリシー、FAQ、運営情報が正しく表示されるか。
- [ ] **広告枠**: 広告設定がない状態で「広告（Sponsored）」のプレースホルダーが表示されているか。
- [ ] **非表示ルール**: 解析中の画面やガイド画面で広告枠が消えているか。

## 3. Web版の環境設定
### 環境変数 (.env)
広告を表示するには以下の環境変数の設定が必要です。未設定時はプレースホルダーが表示されます。

```env
VITE_ADSENSE_PUBLISHER_ID=pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_SLOT_BANNER=XXXXXXXXXX
VITE_ADSENSE_SLOT_MREC=XXXXXXXXXX
```

## 4. 実行手順
```bash
# ビルド
npm run build

# 動作確認 (ローカル)
npm run preview
```

## 5. Android版との互換性
本Web移行対応後も、既存のAndroidプロジェクト（Capacitor）を壊しません。
`isNativePlatform()` により、Android環境では引き続き AdMob 広告とネイティブ機能が優先されます。

## 6. デプロイ手順 (Firebase)
```bash
# Firebaseログイン (初回のみ)
firebase login

# プレビューデプロイ
firebase hosting:channel:deploy

# 本番デプロイ
firebase deploy --only hosting
```
