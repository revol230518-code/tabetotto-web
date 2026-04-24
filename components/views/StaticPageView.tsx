
import React from 'react';
import { ChevronLeft, Info, Shield, HelpCircle, AlertTriangle, BookOpen, ExternalLink, Globe, Instagram, MessageCircle, MapPin, UserCircle } from 'lucide-react';
import { AppView } from '../../types';
import { motion } from 'motion/react';
import Mascot from '../Mascot';
import { OPERATOR_INFO, RELUCK_URLS } from '../../constants/urls';

import { Capacitor } from '@capacitor/core';

interface StaticPageViewProps {
  view: AppView;
  onBack: () => void;
  setView: (view: AppView) => void;
}

const AndroidApp案内 = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 space-y-4 my-8">
        <h4 className="font-black text-rose-500">Android端末をお使いの方へ</h4>
        <p className="text-sm text-stone-600 leading-relaxed">
            たべとっと。は、Android専用のアプリ版もご用意しております。お好みの環境でぜひご利用ください。
        </p>
        <a 
            href="https://play.google.com/store/apps/details?id=com.revo.tabetotto&pcampaignid=web_share"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 bg-stone-800 text-white rounded-xl text-center text-sm font-bold active:scale-95 transition-all"
        >
            Android版アプリを見る
        </a>
    </div>
);

const StaticPageView: React.FC<StaticPageViewProps> = ({ view, onBack, setView }) => {
  const renderContent = () => {
    switch (view) {
      case AppView.OWNER:
        return (
          <div className="space-y-8">
            <header className="space-y-2">
              <div className="mb-4">
                <Mascot message="たべとっと。を作っている人のこと。" size={48} />
              </div>
              <h2 className="text-2xl font-black text-rose-500 flex items-center gap-2">
                <UserCircle size={28} /> {OPERATOR_INFO.APP_NAME} 運営者情報
              </h2>
              <p className="text-sm text-stone-600 font-bold leading-relaxed">
                {OPERATOR_INFO.APP_NAME}の開発・運営に関する情報と、関連する活動のご案内です。
              </p>
            </header>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 space-y-4">
              <h3 className="font-black text-rose-500 border-b pb-2">{OPERATOR_INFO.APP_NAME}について</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {OPERATOR_INFO.APP_NAME}は、{OPERATOR_INFO.OPERATOR_NAME}が運営する、食事や体重をゆるく記録するためのWEBアプリです。<br />
                日々の食事や体重を見える化し、生活を見直すきっかけづくりを目的としています。
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-sm border-b border-stone-50 pb-2">
                  <span className="text-stone-400 font-bold">サービス名</span>
                  <span className="font-black text-stone-700">{OPERATOR_INFO.APP_NAME}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-stone-50 pb-2">
                  <span className="text-stone-400 font-bold">運営名</span>
                  <span className="font-black text-stone-700">{OPERATOR_INFO.OPERATOR_NAME}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-400 font-bold">お問い合わせ</span>
                  <a href={`mailto:${OPERATOR_INFO.CONTACT_EMAIL}`} className="font-black text-rose-500">{OPERATOR_INFO.CONTACT_EMAIL}</a>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
              <h3 className="font-black text-stone-700 border-b pb-2">関連活動</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold rounded">ACTIVITY</span>
                    <h4 className="font-black text-stone-800">整体ジムRe:luck</h4>
                </div>
                <p className="text-xs font-black text-rose-400">身体を整え、動きを覚える</p>
                <p className="text-sm text-stone-600 leading-relaxed">
                    関連活動として、長崎県波佐見町で整体ジムRe:luckを運営しています。<br />
                    整体ジムRe:luckは、「身体を整え、動きを覚える」をコンセプトに、地域の健康づくりや身体づくりをサポートしています。
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="font-black text-stone-700 px-2 flex items-center gap-2">
                <ExternalLink size={18} className="text-stone-400" /> 関連リンク
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {RELUCK_URLS.OFFICIAL && (
                  <a 
                    href={RELUCK_URLS.OFFICIAL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-stone-100 active:scale-[0.98] transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
                      <Globe size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-stone-700">公式サイトを見る</span>
                      <span className="text-[10px] text-stone-400 truncate max-w-[180px]">{RELUCK_URLS.OFFICIAL}</span>
                    </div>
                    <ChevronLeft size={16} className="ml-auto text-stone-300 rotate-180" />
                  </a>
                )}
                {RELUCK_URLS.INSTAGRAM && (
                  <a 
                    href={RELUCK_URLS.INSTAGRAM} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-stone-100 active:scale-[0.98] transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-400">
                      <Instagram size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-stone-700">Instagramを見る</span>
                      <span className="text-[10px] text-stone-400 truncate max-w-[180px]">@r.evol_re.luck</span>
                    </div>
                    <ChevronLeft size={16} className="ml-auto text-stone-300 rotate-180" />
                  </a>
                )}
                {RELUCK_URLS.LINE && (
                  <a 
                    href={RELUCK_URLS.LINE} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-stone-100 active:scale-[0.98] transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                      <MessageCircle size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-stone-700">公式LINEを見る</span>
                      <span className="text-[10px] text-stone-400 truncate max-w-[180px]">LINE友だち追加</span>
                    </div>
                    <ChevronLeft size={16} className="ml-auto text-stone-300 rotate-180" />
                  </a>
                )}
                {RELUCK_URLS.GOOGLE_MAP && (
                  <a 
                    href={RELUCK_URLS.GOOGLE_MAP} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-stone-100 active:scale-[0.98] transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                      <MapPin size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-stone-700">Google Mapで場所を見る</span>
                      <span className="text-[10px] text-stone-400 truncate max-w-[180px]">長崎県東彼杵郡波佐見町</span>
                    </div>
                    <ChevronLeft size={16} className="ml-auto text-stone-300 rotate-180" />
                  </a>
                )}
              </div>
            </section>

            <div className="bg-stone-50 rounded-2xl p-4 text-center">
              <p className="text-xs text-stone-500 leading-relaxed font-bold">
                たべとっと。は地域の健康づくりを応援しています。
              </p>
            </div>
          </div>
        );
      case AppView.USAGE:
        return (
          <div className="space-y-8">
            <header className="space-y-2">
              <div className="mb-4">
                <Mascot message="まずは1枚、写真で残すところから。" size={48} />
              </div>
              <h2 className="text-2xl font-black text-rose-500 flex items-center gap-2">
                <BookOpen size={28} /> たべとっと。の使い方完全ガイド
              </h2>
              <p className="text-sm text-stone-600 font-bold leading-relaxed">
                「たべとっと。」は、食事・体重・姿勢をゆるく記録して見える化するためのアプリです。<br />
                全部を完璧に記録することよりも、まずは「記録を付ける習慣を作る」ことを大切にしています。<br />
                記録が雑でも、続くことで見えてくるものがあります。そのための習慣ツールとしてお使いください。
              </p>
            </header>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 space-y-4">
              <h3 className="font-black text-rose-500 border-b pb-2">最初にしておきたいこと</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                年齢、身長、目標体重、性別、活動量などの基本設定を入れておくと、より見やすいアドバイスが表示されます。<br />
                ただ数字を並べるのではなく、「今の自分をざっくり振り返る」ためにこれらの情報を活用します。
              </p>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4">
              <h3 className="font-black text-stone-700 border-b pb-2">機能と使い方のコツ</h3>
              <div className="space-y-4 text-sm text-stone-600">
                <p><strong>ごはん記録の使い方</strong></p>
                <p className="pl-2">写真を撮る、選ぶ、または手入力でその日の食事を残せます。記録を付ける習慣を作ることが最優先です。朝だけ、昼だけ、外食だけでも十分です。</p>
                
                <p><strong>ホーム画面の見方</strong></p>
                <p className="pl-2">体重・目標との差・BMI・総摂取kcalなどが見られます。全部を厳密に見る必要はありません。「今日は多めだったかな？」といった感覚を、やわらかく確認しましょう。</p>
                
                <p><strong>記録・グラフの見方</strong></p>
                <p className="pl-2">1日単位の変動に振り回されず、少し長めの流れを見ることが大切です。週単位の変化で、リズムを掴むことをおすすめします。</p>

                <p><strong>姿勢チェック</strong></p>
                <p className="pl-2">正面・側面から姿勢傾向をチェックする補助機能です。結果はあくまで参考としてご活用ください。</p>
              </div>
            </section>

            <section className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 space-y-4">
              <h3 className="font-black text-rose-500 border-b pb-2">WEB版を知っておきたいこと</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                WEB版の記録は<strong>ブラウザ内</strong>に保存されます。端末やブラウザを変更・キャッシュ削除すると記録が消える場合があります。<br />
                大切な記録は「画像を保存」機能を使って、端末のフォトライブラリにもバックアップを残してください。
              </p>
            </section>

            <section className="text-center">
               <p className="text-sm font-bold text-stone-500">
                「朝だけ、昼だけ、外食だけでも大丈夫です。まずは記録を付ける習慣を作ることが最優先です。」
               </p>
            </section>
          </div>
        );
      case AppView.FAQ:
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <Mascot message="迷ったときに、ここで確認。" size={48} />
            </div>
            <h2 className="text-2xl font-black text-rose-500 flex items-center gap-2">
              <HelpCircle size={28} /> よくある質問
            </h2>
            <div className="space-y-4">
              {[
                { 
                  q: "料金はかかりますか？", 
                  a: "本アプリは基本無料でお使いいただけます。Web版では運営継続のために一部広告を表示させていただいております。AI解析には一定のサーバーコストがかかりますが、皆様に気軽に使っていただけるよう無料での提供を続けています。" 
                },
                { 
                  q: "写真はどこに保存されますか？", 
                  a: "あなたが撮影した写真や記録データは、すべて「今お使いのブラウザ（端末内）」にのみ保存されます。運営側（クラウド）へ写真が保存されたり公開されたりすることはありません。" 
                },
                { 
                  q: "アプリを消すとデータはどうなりますか？", 
                  a: "Web版の場合、ブラウザのキャッシュ（履歴）削除やデータの初期化を行うと、これまでの記録も失われます。大切な写真は「画像を保存」機能を使って、端末のフォトライブラリに残しておくことをおすすめします。" 
                },
                { 
                  q: "AI解析の精度について知りたい", 
                  a: "最新のAIモデルを使用しており高い精度を誇りますが、あくまで「写真から見た推定値」です。お皿の深さや隠れた具材までは正確に測れないため、目安としてご活用ください。" 
                },
                { 
                  q: "Android版との違いはありますか？", 
                  a: "基本的な機能は共通ですが、Web版はインストール不要で手軽に始められるのが特徴です。バックアップ機能に制限があるため、ホーム画面への追加を行ってご利用ください。" 
                },
                { 
                  q: "Android版アプリはありますか？", 
                  a: "はい、ございます。Android端末向けには、カメラ機能や通知機能を最適化したアプリ版も提供しております。" 
                }
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
                  <h3 className="font-black text-rose-500 mb-2 text-base">Q. {item.q}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">A. {item.a}</p>
                </div>
              ))}
              <AndroidApp案内 />
            </div>
          </div>
        );
      case AppView.PRIVACY:
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <Mascot message="安心して使うための大事な案内。" size={48} />
            </div>
            <h2 className="text-2xl font-black text-rose-500 flex items-center gap-2">
              <Shield size={28} /> プライバシーポリシー
            </h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-6 text-stone-600">
              <section className="space-y-3 px-1">
                <h3 className="font-black text-stone-800 text-lg border-l-4 border-rose-400 pl-3">データの取り扱いについて</h3>
                <p className="text-sm leading-relaxed">
                  本アプリ「たべとっと。」は、ユーザーのプライバシーを最優先に考えています。撮影された写真や入力された健康数値（体重等）は、すべてお使いの端末（Local Storage / IndexedDB）に保存されます。当運営者がこれらのデータをサーバーで収集したり、第三者に提供したりすることはありません。
                </p>
              </section>
              
              <section className="space-y-3 px-1">
                <h3 className="font-black text-stone-800 text-lg border-l-4 border-rose-400 pl-3">AI解析の利用範囲</h3>
                <p className="text-sm leading-relaxed">
                  食事や姿勢の解析にはGoogle Gemini APIを利用しています。解析のために画像データが一時的に送信されますが、これは解析処理のためだけに使用され、AIの学習データとして蓄積・再利用されることはない旨をGoogle社が明言しています。
                </p>
              </section>

              <section className="space-y-3 px-1">
                <h3 className="font-black text-stone-800 text-lg border-l-4 border-rose-400 pl-3">広告および解析ツールの使用</h3>
                <p className="text-sm leading-relaxed">
                  本サイトでは、将来的なサービス改善と運営継続のため、Google AdSenseおよびGoogle Analyticsを使用する場合があります。これらはCookieを使用して、過去のアクセス情報に基づいた広告配信やトラフィック分析を行いますが、個人を特定するものではありません。
                </p>
              </section>

              <section className="space-y-3 opacity-60 text-center py-4">
                <p className="text-[10px]">制定日：2024年4月1日<br/>最終更新日：2024年4月22日<br/>運営：R.evo</p>
              </section>
            </div>
          </div>
        );
      case AppView.TERMS:
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <Mascot message="大事な記録は、画像でも残しておくと安心。" size={48} />
            </div>
            <h2 className="text-2xl font-black text-rose-500 flex items-center gap-2">
              <AlertTriangle size={28} /> ご利用上の注意
            </h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-6">
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3">
                <AlertTriangle size={24} className="text-rose-500 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm text-rose-600 font-bold">データの消失にご注意ください</p>
                  <p className="text-[11px] text-rose-500 leading-relaxed">
                    本アプリはサーバーへのデータ自動保存を行いません。ブラウザの履歴削除、端末の不具合、ブラウザの変更などでこれまでの記録がすべて消える可能性があります。重要な記録はこまめに「画像を保存」から端末内に書き出してください。
                  </p>
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="font-black text-stone-800 flex items-center gap-2 px-4">
                  <Shield size={18} className="text-stone-400" /> 免責事項
                </h3>
                <div className="text-xs text-stone-500 space-y-3 leading-relaxed px-4">
                  <p>1. 本アプリが提供する食事解析（カロリー、PFCバランス等）および姿勢解析の結果は、AIによる推定に基づくものであり、その正確性や医学的な有効性を保証するものではありません。</p>
                  <p>2. 本アプリの結果は医学的な診断、予防、または治療を目的としたものではありません。健康増進の参考としてご利用いただき、体調に不安がある場合は必ず医療機関を受診してください。</p>
                  <p>3. 本アプリの利用により生じたいかなる損害についても、当運営は一切の責任を負いかねます。ご自身の判断と責任においてご利用ください。</p>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="font-black text-stone-800 flex items-center gap-2 px-4">
                  <BookOpen size={18} className="text-stone-400" /> 禁止事項
                </h3>
                <div className="text-xs text-stone-500 space-y-1 ml-4 leading-relaxed px-4">
                  <p>・公序良俗に反する写真の撮影および解析</p>
                  <p>・本サービスの不適切な解析負荷をかける行為</p>
                  <p>・当アプリの運営を妨げる行為</p>
                </div>
              </section>
            </div>
          </div>
        );
      case AppView.INFO:
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <Mascot message="アプリのバージョン情報など。" size={48} />
            </div>
            <h2 className="text-2xl font-black text-rose-500 flex items-center gap-2">
              <Info size={28} /> アプリ情報
            </h2>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-5 p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                  <span className="text-stone-400 text-sm font-bold">アプリ名</span>
                  <span className="font-black text-stone-700 italic">たべとっと。 (Web版)</span>
                </div>
                <div className="flex justify-between items-center border-b border-stone-50 pb-2">
                  <span className="text-stone-400 text-sm font-bold">プラットフォーム</span>
                  <span className="font-black text-stone-700">PWA / Web</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-stone-400 text-sm font-bold">バージョン</span>
                  <span className="font-black text-stone-400 text-xs">v1.2.0 (Web Architecture)</span>
                </div>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 text-center">
                <p className="text-xs text-stone-500 leading-relaxed font-bold">
                  「たべとっと。」は、皆様の日常をゆるくサポートするために、日々開発と改善を続けています。
                </p>
              </div>

              <AndroidApp案内 />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const StaticFooter = () => {
    const isAndroid = Capacitor.getPlatform() === 'android';
    
    // 静的ページ間で遷移するためのリンク群
    const navLinks = [
      { id: AppView.OWNER, label: '運営者情報', icon: UserCircle, webOnly: true },
      { id: AppView.USAGE, label: '使い方', icon: BookOpen },
      { id: AppView.FAQ, label: 'よくある質問', icon: HelpCircle },
      { id: AppView.PRIVACY, label: 'プライバシー', icon: Shield },
      { id: AppView.TERMS, label: '注意事項', icon: AlertTriangle },
    ];

    return (
      <footer className="mt-12 pt-8 border-t border-dashed border-stone-200">
        <div className="grid grid-cols-2 gap-2">
          {navLinks.map((link) => {
            if (link.webOnly && isAndroid) return null;
            if (view === link.id) return null;

            return (
              <button
                key={link.id}
                onClick={() => {
                  setView(link.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 p-3 rounded-xl bg-stone-50 border border-stone-100 text-stone-500 hover:bg-white active:scale-95 transition-all text-xs font-bold"
              >
                <link.icon size={14} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-8 text-center pb-8">
           <p className="text-[10px] font-bold text-stone-300 tracking-widest uppercase mb-1">たべとっと。</p>
           <p className="text-[9px] text-stone-300">© R.evo</p>
        </div>
      </footer>
    );
  };

  const getTitle = () => {
    switch (view) {
      case AppView.USAGE: return "使い方";
      case AppView.FAQ: return "FAQ";
      case AppView.PRIVACY: return "プライバシーポリシー";
      case AppView.TERMS: return "注意事項";
      case AppView.INFO: return "アプリ情報";
      case AppView.OWNER: return "運営者情報";
      default: return "情報";
    }
  };

  return (
    <div className="flex-1 w-full bg-[#fdfbf7] min-h-screen min-h-[100dvh] pb-safe">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-3 border-b shadow-sm border-stone-100">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 active:scale-90 transition-all font-bold"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-black text-stone-700">{getTitle()}</h1>
      </header>

      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-8"
      >
        {renderContent()}
        <StaticFooter />
      </motion.main>
    </div>
  );
};

export default StaticPageView;
