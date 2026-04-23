import React from "react";
import { ChevronLeft, PieChart, Fish, Wheat, Sprout, Apple, Droplet } from "lucide-react";
import { THEME } from "../../theme";
import { Card, Button } from "../UIComponents";
import { PFC_COLORS } from "../../utils";
import { NativeAdCard } from "../AdComponents";

interface NutritionGuideViewProps {
  onBack?: () => void;
}

const NutritionGuideView: React.FC<NutritionGuideViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col min-h-screen pb-safe w-full no-scrollbar overflow-x-hidden" style={{ backgroundColor: THEME.colors.appBg }}>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center gap-3 border-b shadow-sm border-stone-100">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 active:scale-90 transition-all font-bold"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-black text-stone-700">ダイエットの基本知識</h1>
      </header>
      <main className="px-6 pt-6 pb-32 space-y-8 animate-in slide-in-from-right duration-300">
        
        {/* 新規：記事2 反映 */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-rose-500">ダイエットの基本指標</h2>
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100 space-y-4 text-sm text-stone-600 leading-relaxed">
            <p>ダイエットを始めると、体重だけに意識が向きがちですが、体重は水分量や食事内容でも動きます。極端な判断は避け、全体像を見ることが大切です。</p>
            <h4 className="font-bold text-stone-800">● BMIの考え方</h4>
            <p>BMIは身長に対しての体重の目安です。一般的に18.5以上25未満が普通体重の範囲ですが、体質や体調があります。22が標準体重を考える基準としてよく使われます。数字だけですべてを判断せず、体調や生活習慣もあわせて見ることが大切です。</p>
            <h4 className="font-bold text-stone-800">● 1kgあたりのエネルギー</h4>
            <p>体脂肪を1kg減らすには、約7,000〜7,200kcalのマイナスが必要です。1日あたり230〜240kcal程度を食事や運動で調整するイメージを持つと、無理のない計画が立てやすくなります。</p>
          </div>
        </div>

        {/* 新規：記事3 反映 */}
        <div className="space-y-6">
          <h2 className="text-xl font-black text-rose-500">続けやすい食事記録のコツ</h2>
          <div className="bg-gradient-to-b from-rose-50 to-white rounded-3xl p-6 shadow-sm border border-rose-100 space-y-4 text-sm text-stone-600 leading-relaxed">
            <p>食事記録が続かない理由は「ちゃんとやらないと意味がない」と考えてしまうことかもしれません。しかし、完璧さよりも「やめないこと」が価値になります。</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>毎食きっちり記録しなくていい：</strong>忙しい日は1日1回だけ、気になる食事だけでも十分です。</li>
              <li><strong>写真で残す：</strong>文章入力が面倒なら写真だけでもOK。「パンが多いな」「意外と食べてるな」という気づきが大切です。</li>
              <li><strong>食べすぎた日があってもいい：</strong>反省しすぎず、次の日に戻ることの方が重要です。</li>
            </ul>
            <p className="font-bold text-stone-700">「0より1」が、最も効果的です。</p>
          </div>
        </div>

        {/* 既存：栄養バランスの基本 */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 opacity-40 mb-4 mt-8">
            <div className="h-[2px] flex-1 bg-stone-400 rounded-full" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-600">栄養バランスの基本</span>
            <div className="h-[2px] flex-1 bg-stone-400 rounded-full" />
          </div>

          <Card
            className="!p-5 bg-white border-2 border-b-4 flex flex-col sm:flex-row items-start gap-4 organic-card"
            style={{ borderColor: PFC_COLORS.p }}
          >
            <div
              className="p-3 rounded-2xl bg-[#FFF0F0] shrink-0 shadow-sm border-2 border-b-4"
              style={{ borderColor: `${PFC_COLORS.p}40` }}
            >
              <Fish size={24} style={{ color: PFC_COLORS.p }} />
            </div>
            <div className="flex-1 w-full">
              <h3
                className="text-base font-black mb-2"
                style={{ color: PFC_COLORS.p }}
              >
                P (Protein) タンパク質
              </h3>
              <p className="text-sm font-bold text-[#5D5745] leading-relaxed">
                筋肉や肌、髪を作る重要な栄養素。不足すると代謝が落ちやすくなります。
              </p>
              <div className="space-y-2 mt-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 block mb-1">
                    代表的な食材
                  </span>
                  <span className="text-xs font-bold text-stone-600">
                    肉、魚、卵、大豆製品、乳製品
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 block mb-1 flex items-center gap-1">
                    🌟 上手な取り入れ方
                  </span>
                  <span className="text-xs font-bold text-stone-600 leading-relaxed">
                    お肉だけでなく、お魚や大豆製品など色々な食材からバランスよく摂るのがおすすめです！
                  </span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card
            className="!p-5 bg-white border-2 border-b-4 flex flex-col sm:flex-row items-start gap-4 organic-card"
            style={{ borderColor: PFC_COLORS.f }}
          >
            <div
              className="p-3 rounded-2xl bg-[#FFFDE7] shrink-0 shadow-sm border-2 border-b-4"
              style={{ borderColor: `${PFC_COLORS.f}40` }}
            >
              <Droplet size={24} style={{ color: PFC_COLORS.f }} />
            </div>
            <div className="flex-1 w-full">
              <h3
                className="text-base font-black mb-2"
                style={{ color: PFC_COLORS.f }}
              >
                F (Fat) 脂質
              </h3>
              <p className="text-sm font-bold text-[#5D5745] leading-relaxed">
                エネルギー源や細胞膜の材料。摂りすぎは注意ですが、極端な制限もNGです。
              </p>
              <div className="space-y-2 mt-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 block mb-1">
                    代表的な食材
                  </span>
                  <span className="text-xs font-bold text-stone-600">
                    オリーブオイル、ナッツ、アボカド、青魚
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 block mb-1 flex items-center gap-1">
                    🌟 上手な取り入れ方
                  </span>
                  <span className="text-xs font-bold text-stone-600 leading-relaxed">
                    揚げ物やスナック菓子は控えめにしつつ、お魚の脂やオリーブオイルなどの「良質な脂質」を適量取り入れましょう。
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card
            className="!p-5 bg-white border-2 border-b-4 flex flex-col sm:flex-row items-start gap-4 organic-card"
            style={{ borderColor: PFC_COLORS.c }}
          >
            <div
              className="p-3 rounded-2xl bg-[#FFF3E0] shrink-0 shadow-sm border-2 border-b-4"
              style={{ borderColor: `${PFC_COLORS.c}40` }}
            >
              <Wheat size={24} style={{ color: PFC_COLORS.c }} />
            </div>
            <div className="flex-1 w-full">
              <h3
                className="text-base font-black mb-2"
                style={{ color: PFC_COLORS.c }}
              >
                C (Carb) 炭水化物
              </h3>
              <p className="text-sm font-bold text-[#5D5745] leading-relaxed">
                脳や体の主要なエネルギー源。食物繊維もここに含まれます。
              </p>
              <div className="space-y-2 mt-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 block mb-1">
                    代表的な食材
                  </span>
                  <span className="text-xs font-bold text-stone-600">
                    ご飯、パン、麺類、芋類
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 block mb-1 flex items-center gap-1">
                    🌟 上手な取り入れ方
                  </span>
                  <span className="text-xs font-bold text-stone-600 leading-relaxed">
                    真っ白なパンよりも玄米や全粒粉パンなど、「茶色い炭水化物」を選ぶと、食物繊維も一緒に摂れてダイエットに効果的です。
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-3 opacity-40 mb-4 mt-10">
            <div className="h-[2px] flex-1 bg-stone-400 rounded-full"></div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-600">
              調子を整える栄養素
            </span>
            <div className="h-[2px] flex-1 bg-stone-400 rounded-full"></div>
          </div>

          <Card
            className="!p-5 bg-white border-2 border-b-4 flex flex-col sm:flex-row items-start gap-4 organic-card"
            style={{ borderColor: "#A0937D" }}
          >
            <div
              className="p-3 rounded-2xl bg-stone-100 shrink-0 shadow-sm border-2 border-b-4"
              style={{ borderColor: "#A0937D40" }}
            >
              <Apple size={24} className="text-stone-500" />
            </div>
            <div className="flex-1 w-full">
              <h3 className="text-base font-black mb-2 text-stone-600">
                ビタミン・ミネラル
              </h3>
              <p className="text-sm font-bold text-[#5D5745] leading-relaxed mb-3">
                3大栄養素の代謝を助け、体の調子を整えます。「5大栄養素」の残り2つです。不足すると疲れやすくなることも。
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 block mb-1">
                    代表的な食材
                  </span>
                  <span className="text-xs font-bold text-stone-600">
                    野菜、果物、海藻、乳製品
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 block mb-1 flex items-center gap-1">
                    🌟 上手な取り入れ方
                  </span>
                  <span className="text-xs font-bold text-stone-600 leading-relaxed">
                    毎食小鉢1品を追加したり、「色の濃い野菜」と「淡色の野菜」を両方意識すると、バランスよく補えます。
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card
            className="!p-5 bg-white border-2 border-b-4 flex flex-col sm:flex-row items-start gap-4 organic-card"
            style={{ borderColor: THEME.colors.posturePrimary }}
          >
            <div
              className="p-3 rounded-2xl bg-[#F0FAF5] shrink-0 shadow-sm border-2 border-b-4"
              style={{ borderColor: `${THEME.colors.posturePrimary}40` }}
            >
              <Sprout size={24} style={{ color: THEME.colors.posturePrimary }} />
            </div>
            <div className="flex-1 w-full">
              <h3
                className="text-base font-black mb-2"
                style={{ color: THEME.colors.posturePrimary }}
              >
                食物繊維
              </h3>
              <p className="text-sm font-bold text-[#5D5745] leading-relaxed mb-3">
                お腹の調子を整え、血糖値の上昇を緩やかにする働きがあります。「第6の栄養素」とも呼ばれる頼もしい存在です。
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 block mb-1">
                    代表的な食材
                  </span>
                  <span className="text-xs font-bold text-stone-600">
                    きのこ、海藻、ごぼうやレンコンなどの根菜類
                  </span>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-black text-stone-400 block mb-1 flex items-center gap-1">
                    🌟 上手な取り入れ方
                  </span>
                  <span className="text-xs font-bold text-stone-600 leading-relaxed">
                    スープやお味噌汁の具材を増やしたり、ご飯に大麦やもち麦を少し混ぜるだけでも手軽にアップできますよ！
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div
          className="bg-[#FFF8F0] p-8 rounded-[40px] border-2 border-b-4 border-dashed text-center space-y-4 shadow-inner relative overflow-hidden"
          style={{ borderColor: THEME.colors.border }}
        >
          <div className="absolute -bottom-6 -right-6 opacity-10 pointer-events-none motion-safe:animate-breathe-subtle">
            <img
              src="/tabetotto.mascot.svg"
              alt=""
              className="w-32 h-32 object-contain transform rotate-12"
            />
          </div>
          <div
            className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto border-2 border-b-4 relative z-10"
            style={{ borderColor: THEME.colors.border }}
          >
            <PieChart size={28} className="text-stone-400" />
          </div>
          <p
            className="text-xs font-bold leading-relaxed relative z-10"
            style={{ color: THEME.colors.textPrimary }}
          >
            たべとっと。のAIは、写真からこれらの比率を推定して
            <br />
            アドバイスを作成しています。
            <br />
            毎食完璧を目指さず、1日や1週間単位で
            <br />
            バランスを整えていきましょう！
          </p>
        </div>

        <NativeAdCard className="mt-8" />

        {onBack && (
          <div className="flex flex-col items-center mt-8 relative">
            <div className="absolute -top-10 right-8 pointer-events-none animate-sway z-0">
              <img
                src="/tabetotto.mascot.svg"
                alt=""
                className="w-12 h-12 object-contain transform rotate-12 opacity-80"
              />
            </div>
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full max-w-xs shadow-sm relative z-10 bg-white"
            >
              ごはん記録にもどる
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default NutritionGuideView;