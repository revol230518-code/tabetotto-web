import React from "react";
import { PieChart, Fish, Wheat, Sprout, Apple, Droplet } from "lucide-react";
import { THEME } from "../../theme";
import { Card, Button } from "../UIComponents";
import { PFC_COLORS } from "../../utils";

interface NutritionGuideViewProps {
  onBack?: () => void;
}

const NutritionGuideView: React.FC<NutritionGuideViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col min-h-screen pb-safe w-full no-scrollbar overflow-x-hidden" style={{ backgroundColor: THEME.colors.appBg }}>
      <main className="px-6 pt-6 pb-32 space-y-8 animate-in slide-in-from-right duration-300">
        <div className="text-center space-y-4 py-4">
          <div
            className="w-20 h-20 bg-white rounded-[32px] shadow-sm border-2 border-b-4 flex items-center justify-center mx-auto mb-2"
            style={{ borderColor: THEME.colors.readPrimary }}
          >
            <img
              src="/tabetotto.mascot.svg"
              alt="たべとっと"
              className="w-12 h-12 object-contain motion-safe:animate-breathe-subtle"
            />
          </div>
          <h2
            className="text-2xl font-black"
            style={{ color: THEME.colors.readPrimary }}
          >
            バランスの基本
          </h2>
          <p
            className="text-sm font-bold opacity-70 leading-relaxed max-w-[280px] mx-auto"
            style={{ color: THEME.colors.textPrimary }}
          >
            健康的なダイエットには、
            <br />
            「5大栄養素」＋「食物繊維」
            <br />
            のバランスが重要です。
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 opacity-40 mb-4 mt-8">
            <div className="h-[2px] flex-1 bg-stone-400 rounded-full"></div>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-600">
              3大栄養素 (PFC)
            </span>
            <div className="h-[2px] flex-1 bg-stone-400 rounded-full"></div>
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
