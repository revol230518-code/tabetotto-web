
import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Utensils, Info, HelpCircle, ArrowRight, Camera, Sparkles, LayoutDashboard, Heart, History, CheckCircle2 } from 'lucide-react';
import { AppView } from '../../types';
import Mascot from '../Mascot';
import { Button } from '../UIComponents';
import { WebAdUnit } from '../AdComponents';

interface LandingViewProps {
  onNavigate: (view: AppView) => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 w-full bg-[#fdfbf7] p-0 m-0">
      {/* Hero Section */}
      <section className="px-6 pt-12 pb-16 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10">
          <div className="absolute top-10 right-10 w-32 h-32 bg-rose-200 rounded-full blur-3xl scale-150" />
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-emerald-100 rounded-full blur-3xl scale-150" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-4"
        >
          <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center p-2 border-4 border-rose-50">
             <img src="/tabetotto.mascot.svg" alt="たべとっと。" className="w-16 h-16" referrerPolicy="no-referrer" />
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="space-y-4"
        >
          <h1 className="text-4xl font-black text-stone-800 tracking-tight leading-[1.3]">
            たべとっと。<br/>
            <span className="text-rose-500 text-2xl">食事・体重・姿勢を<br/>ゆるく記録して整える。</span>
          </h1>
          <p className="text-stone-500 font-bold text-sm leading-relaxed max-w-xs mx-auto">
            面倒な計算はAIにおまかせ。<br/>
            「今の自分」を写真1枚から見える化する、<br/>
            習慣化サポートWEBアプリです。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <Button 
            onClick={() => onNavigate(AppView.DASHBOARD)}
            className="w-full h-16 !rounded-3xl shadow-xl hover:shadow-2xl active:scale-95 transition-all text-lg font-black flex items-center justify-center gap-3 bg-stone-800 text-white"
          >
            <LayoutDashboard size={24} />
            アプリをはじめる
          </Button>
          <p className="mt-4 text-[10px] text-stone-400 font-black tracking-widest uppercase">ログイン不要 ・ インストール不要</p>
        </motion.div>
      </section>

      <WebAdUnit className="mx-6" />

      {/* Concept Section */}
      <section className="px-6 py-16 bg-white rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.02)] space-y-16">
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <Sparkles className="text-rose-400" size={24} />
            <h2 className="text-2xl font-black text-stone-800">たべとっと。とは</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-stone-50 p-7 rounded-[2.5rem] border border-stone-100 flex flex-col gap-6">
               <div className="flex gap-4 items-center">
                 <Mascot size={56} className="shrink-0" />
                 <p className="font-black text-stone-700 leading-tight">
                   「もっと自分を好きになる」ための、<br/>
                   やさしい記録ツールです。
                 </p>
               </div>
               <div className="space-y-4 text-sm font-medium text-stone-600 leading-relaxed">
                 <p>
                   ダイエットや健康管理を始めるとき、一番のハードルは「記録の面倒くささ」や「数字へのプレッシャー」ではないでしょうか。
                 </p>
                 <p>
                   たべとっと。は、そんなハードルを極限まで下げました。<br/>
                   食事の写真はAIが解析し、体重や姿勢の変化も直感的に確認できます。
                 </p>
                 <p>
                   100点満点を目指す必要はありません。昨日より少しだけ意識できた自分を認めてあげる。そんな「ゆるい習慣」が、一歩先の大切な健康へと繋がります。
                 </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-100/50 space-y-2">
                 <Heart className="text-rose-400" size={24} />
                 <h4 className="font-black text-stone-800 text-sm">自分を認める</h4>
                 <p className="text-[10px] text-stone-500 leading-relaxed font-bold">できたことを数える、やさしい設計。</p>
               </div>
               <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100/50 space-y-2">
                 <History className="text-emerald-400" size={24} />
                 <h4 className="font-black text-stone-800 text-sm">流れを見る</h4>
                 <p className="text-[10px] text-stone-500 leading-relaxed font-bold">週単位のリズムを大切にします。</p>
               </div>
            </div>
          </div>
        </div>

        {/* Feature Detail Section */}
        <div className="space-y-10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-stone-400" size={24} />
            <h2 className="text-2xl font-black text-stone-800">主な機能</h2>
          </div>

          <div className="space-y-12">
            {[
              { 
                title: "AI食事解析", 
                desc: "写真を撮る・選ぶだけで、AIがメニュー名、カロリー、PFCバランス（タンパク質・脂質・炭水化物）を推定。目分量での入力や複雑な検索は不要です。", 
                icon: Camera, 
                color: "rose" 
              },
              { 
                title: "姿勢バランス分析", 
                desc: "正面や横からの写真を分析し、今の姿勢の傾向（猫背、反り腰など）をチェック。改善ポイントをアドバイスし、立ち姿からも健康を支えます。", 
                icon: Sparkles, 
                color: "emerald" 
              },
              { 
                title: "体重・栄養グラフ", 
                desc: "入力した体重や解析された栄養素は自動的にグラフ化。目標までの距離を視覚的に把握でき、モチベーション維持に役立ちます。", 
                icon: Utensils, 
                color: "blue" 
              }
            ].map((f, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 bg-${f.color}-50 text-${f.color}-500 shadow-sm border border-${f.color}-100`}>
                  <f.icon size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-stone-800 text-xl">{f.title}</h3>
                  <p className="text-sm text-stone-500 font-bold leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <WebAdUnit slot="mrec" />

        {/* Content Navigation */}
        <div className="space-y-8 pt-6">
          <div className="flex items-center gap-2">
            <BookOpen className="text-stone-400" size={24} />
            <h2 className="text-2xl font-black text-stone-800">お役立ちガイド</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              { id: AppView.USAGE, title: "はじめての使い方", desc: "操作方法やコツはこちら", icon: HelpCircle, color: "stone" },
              { id: AppView.NUTRITION_GUIDE, title: "栄養・数字の見方ガイド", desc: "BMI、PFC、カロリー目安をやさしく解説", icon: Utensils, color: "stone" },
              { id: AppView.ARTICLES, title: "読みもの一覧", desc: "コラムや健康のヒント集", icon: BookOpen, color: "stone" },
              { id: AppView.FAQ, title: "よくある質問", desc: "料金、データ保存、AI解析について", icon: Info, color: "stone" }
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className="flex items-center gap-5 p-6 bg-white border-2 border-stone-100 rounded-[2rem] shadow-sm active:scale-[0.98] transition-all text-left group hover:border-rose-100"
              >
                <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover:bg-rose-50 group-hover:text-rose-400 transition-colors shrink-0">
                  <link.icon size={26} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-stone-800 text-lg leading-tight group-hover:text-rose-600 transition-colors">{link.title}</p>
                  <p className="text-xs text-stone-400 font-bold mt-1">{link.desc}</p>
                </div>
                <ArrowRight size={20} className="text-stone-300 group-hover:text-rose-300 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Closing Mascot */}
        <div className="pt-16 pb-24 border-t border-dashed border-stone-200">
           <div className="flex flex-col items-center gap-8">
             <Mascot message="あなたの毎日が、もっと軽やかになりますように。" size={64} position="center" />
             
             <div className="space-y-4 text-center">
                <Button 
                    onClick={() => onNavigate(AppView.DASHBOARD)}
                    className="px-8 h-14 !rounded-2xl shadow-lg bg-rose-500 text-white font-black text-base"
                >
                    アプリを開いて記録する
                </Button>
                <p className="text-[10px] text-stone-400 font-bold tracking-widest">NO LOGIN ・ FREE TO USE</p>
             </div>

             <div className="flex items-center gap-5 opacity-40 text-[10px] font-black tracking-widest text-stone-400 pt-8">
               <button onClick={() => onNavigate(AppView.PRIVACY)} className="hover:text-stone-600">PRIVACY</button>
               <span className="w-1 h-1 rounded-full bg-stone-300" />
               <button onClick={() => onNavigate(AppView.TERMS)} className="hover:text-stone-600">TERMS</button>
               <span className="w-1 h-1 rounded-full bg-stone-300" />
               <button onClick={() => onNavigate(AppView.OWNER)} className="hover:text-stone-600">OPERATOR</button>
             </div>
             <p className="text-[10px] text-stone-300 font-bold tracking-wider">© R.evo ALL RIGHTS RESERVED.</p>
           </div>
        </div>
      </section>
    </div>
  );
};

export default LandingView;
