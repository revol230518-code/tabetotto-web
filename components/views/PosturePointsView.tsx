import React from "react";
import { ChevronLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, Button } from "../UIComponents";
import { THEME } from "../../theme";

interface PosturePointsViewProps {
  onBack: () => void;
}

const PosturePointsView: React.FC<PosturePointsViewProps> = ({ onBack }) => {
  const points = [
    {
      title: "頭の頂点を引き上げる",
      desc: "天井から糸で吊るされているようなイメージで、背筋をスッと伸ばします。",
    },
    {
      title: "肩甲骨を寄せて下げる",
      desc: "胸を軽く開き、肩が上がらないようにリラックスさせます。巻き肩を防ぎます。",
    },
    {
      title: "骨盤を真っ直ぐに立てる",
      desc: "反り腰や猫背にならないよう、下腹部に軽く力を入れて重心を中心に置きます。",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-44 w-full no-scrollbar overflow-x-hidden">
      <header
        className="sticky top-0 z-50 pt-safe backdrop-blur-md border-b-4 w-full shadow-sm"
        style={{
          backgroundColor: `${THEME.colors.appBg}E6`,
          borderColor: THEME.colors.border,
        }}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="btn-3d p-3 -ml-2 rounded-2xl hover:bg-black/5 transition-all flex items-center justify-center border-2 border-b-4 bg-white shadow-sm"
              style={{
                borderColor: THEME.colors.border,
                color: THEME.colors.textPrimary,
              }}
            >
              <ChevronLeft size={22} strokeWidth={2.5} />
            </button>
            <div className="flex flex-col ml-1">
              <h1
                className="text-xl font-black tracking-tight leading-none"
                style={{ color: THEME.colors.textPrimary }}
              >
                たべとっと。
              </h1>
              <span
                className="text-[10px] font-bold tracking-widest uppercase opacity-40 mt-0.5"
                style={{ color: THEME.colors.textPrimary }}
              >
                Posture Guide
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8 animate-in slide-in-from-right duration-300 pb-20">
        <div className="text-center space-y-3 py-4">
          <div
            className="inline-block px-5 py-1.5 rounded-full border-2 shadow-sm mb-2 bg-white"
            style={{ borderColor: THEME.colors.posturePrimary }}
          >
            <span
              className="text-[10px] font-black tracking-widest uppercase"
              style={{ color: THEME.colors.posturePrimary }}
            >
              Knowledge Guide
            </span>
          </div>
          <h2
            className="text-2xl font-black"
            style={{ color: THEME.colors.textPrimary }}
          >
            美姿勢の3つのポイント
          </h2>
          <p
            className="text-sm font-bold opacity-70"
            style={{ color: THEME.colors.textPrimary }}
          >
            正しい姿勢はダイエット効率を最大化します
          </p>
        </div>

        <div className="space-y-6">
          {points.map((p, i) => (
            <Card
              key={i}
              className="!p-6 border-2 border-b-4 shadow-lg overflow-hidden relative organic-card"
              style={{ borderColor: THEME.colors.border }}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10"
                style={{ backgroundColor: THEME.colors.posturePrimary }}
              ></div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center font-black text-stone-400 text-xs">
                    0{i + 1}
                  </div>
                  <h3
                    className="text-lg font-black"
                    style={{ color: THEME.colors.textPrimary }}
                  >
                    {p.title}
                  </h3>
                </div>
                <p
                  className="text-sm font-bold leading-relaxed opacity-80 pl-11"
                  style={{ color: THEME.colors.textPrimary }}
                >
                  {p.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div
          className="p-8 rounded-[40px] border-2 border-dashed text-center space-y-5 bg-white shadow-inner"
          style={{ borderColor: THEME.colors.border }}
        >
          <div
            className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto shadow-sm border-2"
            style={{ borderColor: THEME.colors.border }}
          >
            <Sparkles size={24} style={{ color: THEME.colors.posturePrimary }} />
          </div>
          <div className="space-y-3">
            <p
              className="text-sm font-black"
              style={{ color: THEME.colors.textPrimary }}
            >
              撮影のコツ
            </p>
            <div className="bg-stone-50 p-5 rounded-3xl space-y-3">
              <ul
                className="text-xs font-bold text-left space-y-3 inline-block mx-auto"
                style={{ color: THEME.colors.textPrimary }}
              >
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={16} style={{ color: THEME.colors.posturePrimary }} />{" "}
                  壁から少し離れて立ちましょう
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={16} style={{ color: THEME.colors.posturePrimary }} />{" "}
                  足元まで写るようにカメラを設置
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 size={16} style={{ color: THEME.colors.posturePrimary }} />{" "}
                  タイマー機能の活用がおすすめ！
                </li>
              </ul>
            </div>
          </div>
        </div>

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
            variant="secondary"
            className="w-full min-h-[64px] shadow-xl font-black text-lg py-4 rounded-[32px] border-b-4 border-black/10 relative z-10"
          >
            姿勢チェックにもどる
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PosturePointsView;
