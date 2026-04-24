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

interface ArticlesViewProps {
  onBack: () => void;
  setView: (view: AppView, subPath?: string) => void;
}

const ArticlesView: React.FC<ArticlesViewProps> = ({ onBack, setView }) => {
  const categories = [
    {
      title: "たべとっと。について",
      items: [
        { id: "info", title: "たべとっと。とは", view: AppView.INFO, desc: "このアプリのコンセプトと想いをお伝えします。", icon: Info },
        { id: "usage", title: "使い方", view: AppView.USAGE, desc: "基本的な操作方法から使いこなしのコツまで。", icon: BookOpen },
        { id: "faq", title: "よくある質問 (FAQ)", view: AppView.FAQ, desc: "困ったときや疑問に思った際にご覧ください。", icon: HelpCircle },
        { id: "storage", title: "データ保存の注意", view: AppView.INFO, desc: "WEB版の記録がどこに保存されるかをまとめています。", icon: ShieldCheck },
      ]
    },
    {
      title: "栄養・数字の見方ガイド",
      items: [
        { id: "guide", title: "栄養・数字の見方ガイド（入口）", view: AppView.NUTRITION_GUIDE, desc: "PFC、BMI、カロリー目安帯などをやさしく説明します。", icon: FileText },
        { id: "protein", title: "タンパク質", view: AppView.NUTRITION_GUIDE, subPath: "protein", desc: "からだづくりの材料として知られる栄養素です。", icon: Fish },
        { id: "fat", title: "脂質", view: AppView.NUTRITION_GUIDE, subPath: "fat", desc: "エネルギー源としても大切な栄養素です。", icon: Droplet },
        { id: "carb", title: "炭水化物", view: AppView.NUTRITION_GUIDE, subPath: "carb", desc: "日々の活動を支える主なエネルギー源です。", icon: Wheat },
        { id: "vitamin", title: "ビタミン", view: AppView.NUTRITION_GUIDE, subPath: "vitamin", desc: "体の調子を支える栄養素として知られています。", icon: Apple },
        { id: "mineral", title: "ミネラル", view: AppView.NUTRITION_GUIDE, subPath: "mineral", desc: "体の働きを支える栄養素のひとつです。", icon: PieChart },
        { id: "fiber", title: "食物繊維", view: AppView.NUTRITION_GUIDE, subPath: "fiber", desc: "野菜、海藻、きのこ、豆類などに多く含まれる成分です。", icon: Sprout },
        { id: "bmi", title: "BMIの考え方", view: AppView.NUTRITION_GUIDE, subPath: "bmi", desc: "身長と体重から体格の目安を見る指標です。", icon: Scale },
        { id: "calorie", title: "カロリー目安帯", view: AppView.NUTRITION_GUIDE, subPath: "calorie", desc: "食事量を振り返るための目安です。", icon: Flame },
        { id: "activity", title: "活動量", view: AppView.NUTRITION_GUIDE, subPath: "activity", desc: "日々の動き方によって必要なエネルギー量は変わります。", icon: Activity },
        { id: "weekly", title: "週単位で見る意味", view: AppView.NUTRITION_GUIDE, subPath: "weekly", desc: "1日ごとの増減に振り回されず、流れを見るための考え方です。", icon: CalendarDays },
      ]
    },
    {
      title: "運営・規約",
      items: [
        { id: "owner", title: "運営者情報", view: AppView.OWNER, desc: "当サイトの運営会社について。", icon: User },
        { id: "privacy", title: "プライバシーポリシー", view: AppView.PRIVACY, desc: "お客様のデータの取り扱いについて定め透明性を保ちます。", icon: ShieldCheck },
        { id: "terms", title: "利用規約", view: AppView.TERMS, desc: "サービスのご利用にあたっての約束事です。", icon: FileText },
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

        <div className="space-y-10">
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
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border-b-2 border-stone-100 shadow-sm active:scale-[0.98] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400 shrink-0">
                      <item.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-stone-700 text-sm truncate">{item.title}</span>
                      </div>
                      <p className="text-[10px] text-stone-400 font-bold truncate">{item.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-stone-300 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ArticlesView;
