import React, { useState } from "react";
import { 
  ChevronLeft, 
  PieChart, 
  Fish, 
  Wheat, 
  Sprout, 
  Apple, 
  Droplet, 
  Activity, 
  CalendarDays, 
  Scale, 
  Flame, 
  ArrowRight,
  Info
} from "lucide-react";
import { THEME } from "../../theme";
import { Button } from "../UIComponents";
import { PFC_COLORS } from "../../utils";
import { motion, AnimatePresence } from "motion/react";
import Mascot from "../Mascot";

type GuideTab = "home" | "protein" | "fat" | "carb" | "vitamin" | "mineral" | "fiber" | "bmi" | "calorie" | "activity" | "weekly";

interface NutritionGuideViewProps {
  onBack?: () => void;
  activeTab?: string;
  onTabChange?: (tab: GuideTab) => void;
}

const NutritionGuideView: React.FC<NutritionGuideViewProps> = ({ onBack, activeTab, onTabChange }) => {
  const [tab, setTab] = useState<GuideTab>((activeTab as GuideTab) || "home");

  React.useEffect(() => {
    if (activeTab && activeTab !== tab) {
      setTab(activeTab as GuideTab);
    }
  }, [activeTab]);

  const handleSetTab = (newTab: GuideTab) => {
    setTab(newTab);
    onTabChange?.(newTab);
    window.scrollTo({ top: 0 });
  };

  const handleBack = () => {
    if (tab === "home") {
      onBack?.();
    } else {
      handleSetTab("home");
    }
  };

  const PageHeader = ({ title }: { title: string }) => (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md px-4 py-4 flex items-center gap-3 border-b shadow-sm border-stone-100">
      <button 
        onClick={handleBack}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 active:scale-90 transition-all font-bold"
      >
        <ChevronLeft size={24} />
      </button>
      <h1 className="font-black text-xs sm:text-base text-stone-700 truncate">{title}</h1>
    </header>
  );

  const NavigationButtons = ({ prev, next }: { prev?: GuideTab, next?: GuideTab }) => {
    const getLabel = (t: GuideTab) => {
      switch(t) {
        case "protein": return "タンパク質";
        case "fat": return "脂質";
        case "carb": return "炭水化物";
        case "vitamin": return "ビタミン";
        case "mineral": return "ミネラル";
        case "fiber": return "食物繊維";
        case "bmi": return "BMI";
        case "calorie": return "カロリー目安帯";
        case "activity": return "活動量";
        case "weekly": return "週単位で見る意味";
        default: return "";
      }
    };

    return (
      <div className="pt-8 border-t border-dashed border-stone-200 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {prev ? (
            <button onClick={() => handleSetTab(prev)} className="p-4 rounded-2xl bg-stone-50 text-stone-500 text-[10px] font-bold text-left active:scale-95 transition-all flex flex-col gap-1">
              <span className="opacity-50">← 前のページ</span>
              <span className="text-stone-700 truncate">{getLabel(prev)}</span>
            </button>
          ) : <div />}
          {next ? (
            <button onClick={() => handleSetTab(next)} className="p-4 rounded-2xl bg-stone-50 text-stone-500 text-[10px] font-bold text-right active:scale-95 transition-all flex flex-col gap-1">
              <span className="opacity-50">次のページ →</span>
              <span className="text-stone-700 truncate">{getLabel(next)}</span>
            </button>
          ) : <div />}
        </div>
        <Button variant="outline" onClick={() => handleSetTab("home")} className="w-full h-14 !rounded-2xl shadow-sm bg-white">
          ガイド一覧に戻る
        </Button>
      </div>
    );
  };

  const MedicalNotice = () => (
    <div className="bg-stone-100 p-4 rounded-2xl border border-stone-200 my-6">
      <p className="text-[10px] text-stone-500 leading-relaxed font-bold">
        【ご注意】このページの内容は、一般的な健康づくりのための参考情報です。医師による診断や治療、個別の栄養指導に代わるものではありません。持病のある方や通院中の方は、必ず医師の指示に従ってください。
      </p>
    </div>
  );

  const renderContent = () => {
    switch (tab) {
      case "home":
        return (
          <motion.div 
            key="home" 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-500">
                <Info size={20} />
                <h2 className="text-lg font-black italic">ゆるく続ける、健康のコツ。</h2>
              </div>
              <div className="flex justify-center py-2">
                <Mascot message="数字は責めるためではなく、振り返るための目安。" size={48} position="center" />
              </div>
              <p className="text-sm text-stone-600 leading-relaxed font-bold">
                たべとっと。では、食事や体重を細かく管理するのではなく、日々の生活をゆるく振り返るために、kcalやPFC、BMIなどの目安を表示しています。<br/>
                ここでは、アプリ内に出てくる栄養素や数字の見方を、無理なく続けるための参考として紹介します。
              </p>
              <MedicalNotice />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: "protein" as const, title: "タンパク質", icon: Fish, color: PFC_COLORS.p, desc: "からだづくりの材料として知られる栄養素です。" },
                { id: "fat" as const, title: "脂質", icon: Droplet, color: PFC_COLORS.f, desc: "エネルギー源としても大切な栄養素です。" },
                { id: "carb" as const, title: "炭水化物", icon: Wheat, color: PFC_COLORS.c, desc: "日々の活動を支える主なエネルギー源です。" },
                { id: "vitamin" as const, title: "ビタミン", icon: Apple, color: "#FFA726", desc: "体の調子を支える栄養素として知られています。" },
                { id: "mineral" as const, title: "ミネラル", icon: PieChart, color: "#A0937D", desc: "体の働きを支える栄養素のひとつです。" },
                { id: "fiber" as const, title: "食物繊維", icon: Sprout, color: THEME.colors.posturePrimary, desc: "野菜、海藻、きのこ類に多く含まれる成分です。" },
                { id: "bmi" as const, title: "BMI", icon: Scale, color: "#7E57C2", desc: "身長と体重から体格の目安を見る指標です。" },
                { id: "calorie" as const, title: "カロリー目安帯", icon: Flame, color: "#EF5350", desc: "食事量を振り返るための目安です。" },
                { id: "activity" as const, title: "活動量", icon: Activity, color: "#26A69A", desc: "日々の動き方で必要なエネルギーは変わります。" },
                { id: "weekly" as const, title: "週単位で見る意味", icon: CalendarDays, color: "#42A5F5", desc: "流れを見るための大切な考え方です。" },
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => handleSetTab(item.id)}
                  className="flex items-start gap-4 p-5 bg-white rounded-3xl border-2 border-b-4 border-stone-100 shadow-sm active:scale-95 transition-all text-left group"
                >
                  <div className="p-3 rounded-2xl shrink-0 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${item.color}15` }}>
                    <item.icon size={24} style={{ color: item.color }} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="font-black text-stone-700">{item.title}</span>
                      <ArrowRight size={14} className="text-stone-300" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-stone-500 font-bold leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-stone-50 p-6 rounded-[32px] text-center border-2 border-dashed border-stone-200">
               <p className="text-xs text-stone-400 font-bold leading-relaxed">
                 たべとっと。は、あなたの「記録」そのものを応援します。<br/>
                 100点満点の完璧な日を目指すより、<br/>
                 「昨日よりちょっと意識できた」自分を大切にしましょう。
               </p>
            </div>
          </motion.div>
        );

      case "protein":
        return (
          <motion.div key="protein" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="article-content space-y-6">
            <div className="text-center py-6">
              <Mascot message="毎食完璧じゃなくても、流れで見れば大丈夫。" size={40} position="center" className="mb-4" />
              <Fish size={48} className="mx-auto mb-4" style={{ color: PFC_COLORS.p }} />
              <h2 className="text-2xl font-black text-stone-700">タンパク質</h2>
            </div>
            <p>タンパク質は、私たちの筋肉、臓器、皮膚、髪、爪などの「材料」として知られる非常に重要な栄養素です。また、ホルモンや酵素の構成成分としても働きます。</p>
            <h3>● 代表的な食材</h3>
            <p>肉類（牛・豚・鶏など）、魚介類、卵、大豆製品（豆腐・納豆など）、乳製品（チーズ・ヨーグルトなど）に多く含まれています。</p>
            <h3>● たべとっと。での見方</h3>
            <p>アプリ内の解析では、これらの食材の有無や分量を推定してタンパク質の割合を表示しています。厳密な摂取量をグラム単位で気にするよりも、まずはお皿の中に「タンパク源となる食材」が含まれているかどうかをチェックすることから始めてみましょう。</p>
            <p>毎食完璧にそろえるのは大変です。「朝は忙しかったから、夜で少し補おう」といった、1日や数日単位のゆるやかなバランス感覚を大切にしてください。</p>
            <MedicalNotice />
            <NavigationButtons next="fat" />
          </motion.div>
        );

      case "fat":
        return (
          <motion.div key="fat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="article-content space-y-6">
            <div className="text-center py-6">
              <Mascot message="脂質は悪者ではなく、量や偏りに気づくきっかけ。" size={40} position="center" className="mb-4" />
              <Droplet size={48} className="mx-auto mb-4" style={{ color: PFC_COLORS.f }} />
              <h2 className="text-2xl font-black text-stone-700">脂質</h2>
            </div>
            <p>脂質は、効率の良い「エネルギー源」になるとともに、細胞膜の材料やビタミンの吸収を助けるなど、体にとって必要不可欠な役割を担っています。</p>
            <h3>● 代表的な食材</h3>
            <p>調理に使う油（オリーブオイル、サラダ油、バターなど）だけでなく、肉や魚の脂身、ナッツ類、アボカドなどにも含まれます。また、お菓子や揚げ物にも多く含まれています。</p>
            <h3>● 脂質との付き合い方</h3>
            <p>ダイエットにおいて「脂質は悪者」とされがちですが、極端に減らすと肌のカサつきやエネルギー不足を感じることもあります。大切なのは「量」と「種類」に気づくことです。</p>
            <p>たべとっと。では、食事全体のバランスの中で脂質がどれくらいを占めているかを視覚的に表示します。揚げ物が続いたな、油っぽい料理が多かったなと気づいたときは、次の食事をシンプルに焼く・蒸すといった調理法に変えてみるなど、バランスを整えるきっかけとしてお使いください。</p>
            <MedicalNotice />
            <NavigationButtons prev="protein" next="carb" />
          </motion.div>
        );

      case "carb":
        return (
          <motion.div key="carb" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="article-content space-y-6">
            <div className="text-center py-6">
              <Mascot message="日々の活動を支えるエネルギーとして見ていこう。" size={40} position="center" className="mb-4" />
              <Wheat size={48} className="mx-auto mb-4" style={{ color: PFC_COLORS.c }} />
              <h2 className="text-2xl font-black text-stone-700">炭水化物</h2>
            </div>
            <p>炭水化物は、脳や体の活動を支える主役となるエネルギー源です。特に脳にとっては主要なエネルギー源となるため、不足すると集中力の低下を感じることもあります。</p>
            <h3>● 代表的な食材</h3>
            <p>ごはん、パン、麺類などの主食のほか、いも類、果物、お菓子類にも多く含まれます。また、食物繊維もこの炭水化物の仲間に分類されます。</p>
            <h3>● 炭水化物との向き合い方</h3>
            <p>近年のダイエットでは炭水化物を減らすアプローチが流行していますが、極端な制限は心身への負担が大きくなりがちです。主食を抜くのではなく、おかわりを控える、あるいは白米を玄米に変えてみるなど、「質と量」を少しずつ意識することをおすすめします。</p>
            <p>たべとっと。のグラフで炭水化物が多めに表示されたときも、自分を責める必要はありません。「今日はエネルギーをたくさん使ったから大丈夫」「明日は少しご飯の量を調整してみようかな」と、次の一歩を考えるためのヒントとして活用してください。</p>
            <MedicalNotice />
            <NavigationButtons prev="fat" next="vitamin" />
          </motion.div>
        );

      case "vitamin":
        return (
          <motion.div key="vitamin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="article-content space-y-6">
            <div className="text-center py-6">
              <Mascot message="いろいろな食材を見直すきっかけに。" size={40} position="center" className="mb-4" />
              <Apple size={48} className="mx-auto mb-4" style={{ color: "#FFA726" }} />
              <h2 className="text-2xl font-black text-stone-700">ビタミン</h2>
            </div>
            <p>ビタミンは、エネルギーを生み出す代謝を助けたり、体の調子を整えたりする「潤滑油」のような役割を果たします。体内ではほとんど合成できないため、食事から摂る必要があります。</p>
            <h3>● 代表的な食材</h3>
            <p>種類によって異なりますが、野菜、果物、肉、魚、卵など、さまざまな食品に含まれています。特にビタミンCやAなどは緑黄色野菜に、ビタミンB群は肉や魚に多く含まれます。</p>
            <h3>● 食事の偏りに気づくヒントに</h3>
            <p>たべとっと。では厳密なミリグラム単位の解析は行っていませんが、解析結果の中で「ビタミンが含まれる食材」のバランスをゆるく提示します。もしグラフでビタミンが少なそうだと感じたら、サラダを追加する、果物を添える、彩りを少し意識してみるなど、食卓を鮮やかにするイメージで取り入れてみてください。</p>
            <p>完璧な数値を狙うのではなく、「今週は野菜が少なかったかな？」という振り返りのきっかけにするのが、たべとっと。流のビタミンとの付き合い方です。</p>
            <MedicalNotice />
            <NavigationButtons prev="carb" next="mineral" />
          </motion.div>
        );

      case "mineral":
        return (
          <motion.div key="mineral" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="article-content space-y-6">
            <div className="text-center py-6">
              <Mascot message="細かく数えるより、食事の幅を見ていこう。" size={40} position="center" className="mb-4" />
              <PieChart size={48} className="mx-auto mb-4" style={{ color: "#A0937D" }} />
              <h2 className="text-2xl font-black text-stone-700">ミネラル</h2>
            </div>
            <p>ミネラルは、骨や歯を構成したり、体液のバランスを整えたり、筋肉や神経の働きを助けたりと、体の機能を正常に保つために欠かせない栄養素です。</p>
            <h3>● 代表的な食材</h3>
            <p>海藻（わかめ・ひじきなど）、魚介類、大豆製品、野菜、乳製品、ナッツ類などに広く含まれています。鉄分やカルシウム、マグネシウム、亜鉛などがその代表的な例です。</p>
            <h3>● 組み合わせを楽しむ</h3>
            <p>特定のミネラルを計算して摂るのは非常に難しいことです。そのため、たべとっと。では「いろいろな食品を組み合わせているか」という視点を提案しています。</p>
            <p>いつものごはんに、お味噌汁をプラスする。サラダに少しナッツを振りかける。そんな小さな組み合わせの工夫が、必要なミネラルをバランスよく摂ることにつながります。数値に縛られず、食卓の「種類」を増やすことを楽しんでみてください。</p>
            <MedicalNotice />
            <NavigationButtons prev="vitamin" next="fiber" />
          </motion.div>
        );

      case "fiber":
        return (
          <motion.div key="fiber" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="article-content space-y-6">
            <div className="text-center py-6">
              <Mascot message="少しずつ意識できれば、それで十分。" size={40} position="center" className="mb-4" />
              <Sprout size={48} className="mx-auto mb-4" style={{ color: THEME.colors.posturePrimary }} />
              <h2 className="text-2xl font-black text-stone-700">食物繊維</h2>
            </div>
            <p>食物繊維は「第6の栄養素」とも呼ばれ、お腹の調子を整えたり、血糖値の急激な上昇を抑えたり、満足感を高めたりと、ダイエットや健康維持には心強い味方です。</p>
            <h3>● 代表的な食材</h3>
            <p>野菜全般、きのこ類、海藻、大豆製品（おから、納豆など）、ごぼうやレンコンなどの根菜類、玄米やオートミールなどの穀類に多く含まれています。</p>
            <h3>● ゆるく意識する知恵</h3>
            <p>食物繊維の量を正確に把握するのは大変です。「毎食小鉢1品は野菜を入れる」「ごはんに大麦やもち麦を混ぜてみる」「具たくさんのお味噌汁にする」といった、手軽にできる工夫から取り入れてみましょう。</p>
            <p>たべとっと。の解析で食物繊維の少なさが気になったとしても、焦らなくて大丈夫です。まずは「今日一食でも意識できたか」を自分自身で認めてあげてください。少しずつの積み重ねが、大きな変化につながります。</p>
            <MedicalNotice />
            <NavigationButtons prev="mineral" next="bmi" />
          </motion.div>
        );

      case "bmi":
        return (
          <motion.div key="bmi" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="article-content space-y-6">
            <div className="text-center py-6">
              <Mascot message="数字ひとつで決めつけず、流れで見ていこう。" size={40} position="center" className="mb-4" />
              <Scale size={48} className="mx-auto mb-4" style={{ color: "#7E57C2" }} />
              <h2 className="text-2xl font-black text-stone-700">BMIの考え方</h2>
            </div>
            <p>BMI（Body Mass Index）は、身長と体重から算出される体格の目安を示す指標です。以下の計算式で求められます。</p>
            <div className="bg-stone-50 p-4 rounded-xl text-center font-bold text-stone-600 border border-stone-100">
              BMI ＝ 体重(kg) ÷ 身長(m) ÷ 身長(m)
            </div>
            <p>一般的には以下の基準が目安とされています。</p>
            <ul className="list-disc list-inside space-y-2 text-stone-600 pl-4">
              <li>18.5未満：やせ気味</li>
              <li>18.5以上25未満：普通体重</li>
              <li>25以上：肥満気味</li>
            </ul>
            <h3>● 数字だけで決めつけない</h3>
            <p>BMIは便利ですが、完璧な数値ではありません。同じBMIでも、筋肉量が多い方と脂肪量が多い方では体格や健康状態が異なります。また、体質的に少し低め、高めという個性もあります。</p>
            <p>たべとっと。では、BMIを「絶対的な正解」としてではなく、「今の自分を知るためのひとつの物差し」として表示しています。グラフでの推移を確認しながら、生活習慣と照らし合わせて自分なりの良いバランスを探るための参考としてお使いください。</p>
            <MedicalNotice />
            <NavigationButtons prev="fiber" next="calorie" />
          </motion.div>
        );

      case "calorie":
        return (
          <motion.div key="calorie" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="article-content space-y-6">
            <div className="text-center py-6">
              <Mascot message="ぴったり合わせるより、続けやすさを大切に。" size={40} position="center" className="mb-4" />
              <Flame size={48} className="mx-auto mb-4" style={{ color: "#EF5350" }} />
              <h2 className="text-2xl font-black text-stone-700">カロリー目安帯</h2>
            </div>
            <p>たべとっと。で表示される「カロリー目安帯（目安となる色の帯）」は、あなたが設定した身長、体重、目標、活動量などから算出された食事量の参考範囲です。</p>
            <h3>● ぴったり合わせなくていい</h3>
            <p>この帯は「ここに絶対収めなければならない正解」ではありません。日によって動く量も違えば、体調や食欲もあわわります。あまり厳密に追求しすぎると、食事そのものがストレスになってしまいます。</p>
            <p>「帯の中にだいたい収まっているな」「今日はちょっとオーバーしたけど、昨日は少なめだったから平均すればOKかな」といった、ゆとりのある視点で見てください。</p>
            <h3>● 長期的な見通しとしての利用</h3>
            <p>体脂肪1kgを減らすには約7,000〜7,200kcal必要だと言われています。例えば1か月で1kg減らしたい場合、1日あたり240kcal程度の「意識」が目安になります。たべとっと。の目安帯は、こうした緩やかな変化をサポートするための道具です。</p>
            <MedicalNotice />
            <NavigationButtons prev="bmi" next="activity" />
          </motion.div>
        );

      case "activity":
        return (
          <motion.div key="activity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="article-content space-y-6">
            <div className="text-center py-6">
              <Mascot message="生活が変わったら、設定も見直して大丈夫。" size={40} position="center" className="mb-4" />
              <Activity size={48} className="mx-auto mb-4" style={{ color: "#26A69A" }} />
              <h2 className="text-2xl font-black text-stone-700">活動量</h2>
            </div>
            <p>活動量は、日々の生活でどの程度体を動かしているかの指標です。同じ体格の方でも、デスクワーク中心の方と、立ち仕事や外回りをされている方では、必要なエネルギー量は大きく変わります。</p>
            <h3>● アプリ設定のコツ</h3>
            <p>たべとっと。の設定画面で選ぶ活動量は、あなたに合った「カロリー目安帯」を計算するための基本データです。もし現在の生活スタイルが「以前より歩くようになった」「繁忙期でよく動いている」といった変化があれば、設定を自由に見直して構いません。</p>
            <p>厳密に測定しようとするよりも、「自分の生活実感」と数値のズレがないかを確認するためのものと考えてください。もし表示される目安が自分には少なすぎると感じたら、活動量の設定を一段階上げてみるなど、自分にとって心地よい設定を探っていきましょう。</p>
            <MedicalNotice />
            <NavigationButtons prev="calorie" next="weekly" />
          </motion.div>
        );

      case "weekly":
        return (
          <motion.div key="weekly" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="article-content space-y-6">
            <div className="text-center py-6">
              <Mascot message="1日だけで判断せず、ゆるく振り返ろう。" size={40} position="center" className="mb-4" />
              <CalendarDays size={48} className="mx-auto mb-4" style={{ color: "#42A5F5" }} />
              <h2 className="text-2xl font-black text-stone-700">週単位で見る意味</h2>
            </div>
            <p>「昨日の夜、食べすぎちゃったからもうダメだ」——そんな風に思ってしまいがちですが、たべとっと。が最も大切にしてほしいのは、1日ごとの完璧さよりも「週単位、月単位のゆるやかな流れ」です。</p>
            <h3>● 1日の変動に振り回されない</h3>
            <p>体重や食事の数値は、塩分によるむくみや水分の摂取量、睡眠時間やホルモンバランスなど、さまざまな要因で毎日変わります。1日単位での増減で成功や失敗を決めつけるのは、あまり健康的とは言えません。</p>
            <h3>● 振り返りは「点」ではなく「線」</h3>
            <p>1週間を通してみると、「平日は忙しくて食事がおろそかになりがち」「週末は外食で楽しみすぎちゃったな」といった自分の傾向（線）が見えてきます。食べすぎた日があっても後の数日で調整できればよし、一週間全体で見てだいたいバランスが取れていればよし。そんな風に、長い目で自分を認めてあげることが、健やかな習慣を育てる一番の近道です。</p>
            <MedicalNotice />
            <NavigationButtons prev="activity" />
          </motion.div>
        );

      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (tab) {
      case "home": return "栄養・数字の見方ガイド";
      case "protein": return "タンパク質";
      case "fat": return "脂質";
      case "carb": return "炭水化物";
      case "vitamin": return "ビタミン";
      case "mineral": return "ミネラル";
      case "fiber": return "食物繊維";
      case "bmi": return "BMIの考え方";
      case "calorie": return "カロリー目安帯";
      case "activity": return "活動量";
      case "weekly": return "週単位で見る意味";
      default: return "栄養ガイド";
    }
  };

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] pb-safe w-full no-scrollbar overflow-x-hidden" style={{ backgroundColor: THEME.colors.appBg }}>
      <PageHeader title={getTitle()} />
      <main className="px-6 pt-6 pb-32">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>

      <style>{`
        .article-content h2 {
          font-weight: 900;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .article-content h3 {
          font-weight: 900;
          color: #555;
          margin-top: 1.5rem;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }
        .article-content p {
          font-size: 0.95rem;
          line-height: 1.8;
          color: #5D5745;
          font-weight: 500;
        }
        .article-content ul {
          margin-left: 1rem;
          margin-top: 0.5rem;
        }
        @media (max-width: 640px) {
          .article-content p {
            font-size: 0.875rem;
          }
           .article-content h3 {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NutritionGuideView;
