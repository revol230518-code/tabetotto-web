import React from "react";
import { 
  BookOpen, 
  ChevronRight, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  User, 
  ChevronLeft,
  Info,
  Fish,
  Droplet,
  Wheat,
  Apple,
  PieChart,
  Sprout,
  Scale,
  Flame,
  Activity,
  CalendarDays
} from "lucide-react";
import { THEME } from "../../theme";
import { AppView } from "../../types";
import Mascot from "../Mascot";

import { WebAdUnit } from "../AdComponents";

interface ArticlesViewProps {
  onBack: () => void;
  setView: (view: AppView, subPath?: string) => void;
}

const ArticlesView: React.FC<ArticlesViewProps> = ({ onBack, setView }) => {
  interface CategoryItem {
    id: string;
    title: string;
    view: AppView;
    desc: string;
    icon: any;
    subPath?: string;
  }
  
  interface Category {
    title: string;
    items: CategoryItem[];
  }

  const categories: Category[] = [
    {
      title: "たべとっと。の基本案内",
      items: [
        { id: "info", title: "たべとっと。とは", view: AppView.INFO, desc: "アプリのコンセプトと、ゆるい健康管理の始めかた。", icon: Info },
        { id: "usage", title: "はじめての使い方ガイド", view: AppView.USAGE, desc: "食事解析から姿勢チェックまで、操作のコツを網羅。", icon: BookOpen },
        { id: "faq", title: "よくある質問 (FAQ)", view: AppView.FAQ, desc: "データ保存の仕組みや、AI解析のヒントを解説。", icon: HelpCircle },
        { id: "storage", title: "データ保存とバックアップ", view: AppView.INFO, desc: "WEB版の大切な記録を端末に残すための注意点。", icon: ShieldCheck },
      ]
    },
    {
      title: "栄養と数字を知るガイド",
      items: [
        { id: "protein", title: "タンパク質を意識する", view: AppView.NUTRITION_GUIDE, subPath: "protein", desc: "筋肉や髪、肌の元になる大切な栄養素の役割。", icon: Fish },
        { id: "fat", title: "脂質との上手な付き合い方", view: AppView.NUTRITION_GUIDE, subPath: "fat", desc: "エネルギー源としてだけでなく、体の調子を整える成分。", icon: Droplet },
        { id: "carb", title: "炭水化物（糖質）の基本", view: AppView.NUTRITION_GUIDE, subPath: "carb", desc: "日々の活動エネルギーをかしこく摂取するために。", icon: Wheat },
        { id: "vitamin", title: "ビタミンで調子を整える", view: AppView.NUTRITION_GUIDE, subPath: "vitamin", desc: "代謝を助け、毎日を元気に過ごすための潤滑油。", icon: Apple },
        { id: "mineral", title: "ミネラルの重要性", view: AppView.NUTRITION_GUIDE, subPath: "mineral", desc: "カルシウムや鉄分など、不足しがちな微量栄養素。", icon: PieChart },
        { id: "fiber", title: "食物繊維をとろう", view: AppView.NUTRITION_GUIDE, subPath: "fiber", desc: "スッキリ習慣に欠かせない、第六の栄養素。", icon: Sprout },
      ]
    },
    {
      title: "体組成とリズムの考え方",
      items: [
        { id: "bmi", title: "BMIと目標体重の考え方", view: AppView.NUTRITION_GUIDE, subPath: "bmi", desc: "身長と体重から、あなたに合ったバランスを知る。", icon: Scale },
        { id: "calorie", title: "摂取カロリー目安の見方", view: AppView.NUTRITION_GUIDE, subPath: "calorie", desc: "「とりすぎ」を防ぐための、やさしい基準値の活用法。", icon: Flame },
        { id: "activity", title: "生活と活動量レベル", view: AppView.NUTRITION_GUIDE, subPath: "activity", desc: "デスクワークか立ち仕事かで変わる、必要なエネルギー量。", icon: Activity },
        { id: "weekly", title: "週単位で見るダイエット", view: AppView.NUTRITION_GUIDE, subPath: "weekly", desc: "1日の増減に一喜一憂しない、心のゆとりの持ち方。", icon: CalendarDays },
      ]
    },
    {
      title: "運営・プライバシー",
      items: [
        { id: "owner", title: "運営者・開発者情報", view: AppView.OWNER, desc: "たべとっと。を運営しているチームについて。", icon: User },
        { id: "privacy", title: "プライバシーポリシー", view: AppView.PRIVACY, desc: "端末内保存の仕組みとGoogle AIの利用について。", icon: ShieldCheck },
        { id: "terms", title: "ご利用上の注意（規約）", view: AppView.TERMS, desc: "サービス利用における免責事項をご案内します。", icon: FileText },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] pb-safe w-full no-scrollbar overflow-x-hidden" style={{ backgroundColor: THEME.colors.appBg }}>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-4 py-4 flex items-center gap-3 border-b shadow-sm border-stone-100">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 active:scale-90 transition-all font-bold"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-black text-xs sm:text-base text-stone-700 truncate">読みもの一覧</h1>
      </header>

      <main className="px-6 pt-6 pb-32 max-w-2xl mx-auto w-full">
        <div className="mb-6 flex justify-center">
          <Mascot message="気になるところから、ゆるく見ていこう。" position="center" />
        </div>

        <div className="mb-8 p-6 bg-rose-50 rounded-[2rem] border border-rose-100">
           <h2 className="text-rose-600 font-black text-lg mb-2 flex items-center gap-2">
             <BookOpen size={20} />
             知っておくと役立つコト。
           </h2>
           <p className="text-xs text-rose-500 font-bold leading-relaxed">
             たべとっと。WEB版では、食事の解析だけでなく、健康的な食生活をゆるく続けるためのヒントを読みものとしてお届けしています。
           </p>
        </div>

        <WebAdUnit />

        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category.title} className="space-y-4">
              <h3 className="text-sm font-black text-stone-400 px-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                {category.title}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {category.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setView(item.view, item.subPath)}
                    className="flex items-center gap-4 p-5 bg-white rounded-3xl border-b-4 border-stone-100 shadow-sm active:scale-[0.98] transition-all text-left group hover:border-rose-100 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 shrink-0 group-hover:bg-rose-50 group-hover:text-rose-400 transition-colors">
                      <item.icon size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-stone-700 text-base truncate group-hover:text-rose-600 transition-colors">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-stone-400 font-bold leading-tight mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight size={18} className="text-stone-300 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <WebAdUnit slot="mrec" />
      </main>
    </div>
  );
};

export default ArticlesView;
