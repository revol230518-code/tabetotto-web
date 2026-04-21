
import React from 'react';
import { ChevronLeft, Info, Shield, HelpCircle, AlertTriangle, BookOpen } from 'lucide-react';
import { AppView } from '../../types';
import { motion } from 'motion/react';

interface StaticPageViewProps {
  view: AppView;
  onBack: () => void;
}

const StaticPageView: React.FC<StaticPageViewProps> = ({ view, onBack }) => {
  const renderContent = () => {
    switch (view) {
      case AppView.USAGE:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-rose-500 flex items-center gap-2">
              <BookOpen size={24} /> 使い方
            </h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">1</div>
                <div>
                  <h3 className="font-bold">食事を記録する</h3>
                  <p className="text-sm text-stone-500">食事の写真を撮るだけで、AIが栄養素やカロリーを推定します。</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">2</div>
                <div>
                  <h3 className="font-bold">姿勢をチェックする</h3>
                  <p className="text-sm text-stone-500">正面と横からの姿勢をAIが解析し、理想の体型作りをサポートします。</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">3</div>
                <div>
                  <h3 className="font-bold">振り返る</h3>
                  <p className="text-sm text-stone-500">カレンダーやグラフで日々の変化を確認しましょう。</p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 text-center">※本アプリの解析結果は目安です。健康上の判断は専門家にご相談ください。</p>
          </div>
        );
      case AppView.FAQ:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-rose-500 flex items-center gap-2">
              <HelpCircle size={24} /> よくある質問
            </h2>
            <div className="space-y-4">
              {[
                { q: "料金はかかりますか？", a: "基本無料でご利用いただけます。Web版では広告が表示される場合があります。" },
                { q: "データはどこに保存されますか？", a: "入力されたデータや写真は、お使いのブラウザ（端末内）にのみ保存されます。サーバーへは保存されません。" },
                { q: "機種変更でデータは引き継げますか？", a: "現在のWeb版ではクラウド同期機能がないため、機種変更やブラウザのデータ削除を行うとデータは失われます。ご注意ください。" },
                { q: "AI解析がうまくいきません", a: "明るい場所で、対象がはっきりと写るように撮影してください。" }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
                  <h3 className="font-bold text-rose-400 mb-1">Q. {item.q}</h3>
                  <p className="text-sm text-stone-500">A. {item.a}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case AppView.PRIVACY:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-rose-500 flex items-center gap-2">
              <Shield size={24} /> プライバシーポリシー
            </h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 prose prose-sm text-stone-600">
              <h3 className="font-black text-stone-800">データの取り扱いについて</h3>
              <p>本アプリは、ユーザーが撮影した写真や入力した健康データを端末内のLocalStorageにのみ保存します。当社がこれらのデータを収集・蓄積することはありません。</p>
              
              <h3 className="font-black text-stone-800">AI解析について</h3>
              <p>写真データの解析にはGoogleのGemini APIを使用します。解析のために一時的に送信されますが、データが学習目的で使用されることはありません。</p>

              <h3 className="font-black text-stone-800">広告について</h3>
              <p>本アプリでは、持続的な運営のためにGoogle AdSenseを使用しています。Cookie等を用いて、ユーザーの興味に基づいた広告を表示する場合があります。</p>
            </div>
          </div>
        );
      case AppView.TERMS:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-rose-500 flex items-center gap-2">
              <AlertTriangle size={24} /> 注意事項
            </h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 space-y-4">
              <div className="bg-amber-50 rounded-xl p-4 flex gap-3">
                <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 font-bold">ブラウザの「キャッシュ削除」や「シークレットモード」での利用は、データが消去される原因となりますのでご注意ください。</p>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                本サービスはAIによる推定結果を提供するものであり、医学的な助言や診断に代わるものではありません。
                食事療法や運動プログラムを開始する前には、必ず医師にご相談ください。
              </p>
            </div>
          </div>
        );
      case AppView.INFO:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-rose-500 flex items-center gap-2">
              <Info size={24} /> 運営情報
            </h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-stone-400 text-sm">アプリ名</span>
                <span className="font-black">たべとっと。</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-stone-400 text-sm">提供元</span>
                <span className="font-black">Tabetotto Project</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-stone-400 text-sm">バージョン</span>
                <span className="font-black">v1.0 (Web)</span>
              </div>
              <div className="py-4">
                <p className="text-xs text-stone-400 text-center">お問い合わせは、アプリ公式SNSまでご連絡ください。</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 w-full bg-[#fdfbf7] min-h-screen pb-safe">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-3 border-b">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 active:scale-90 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-black text-stone-700">情報</h1>
      </header>

      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-8"
      >
        {renderContent()}
      </motion.main>
    </div>
  );
};

export default StaticPageView;
