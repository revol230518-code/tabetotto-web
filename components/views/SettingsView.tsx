import {
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Scale,
  CalendarClock,
  AlertCircle,
} from "lucide-react";
import React from "react";
import { THEME } from "../../theme";
import { AppView, UserProfile } from "../../types";
import {
  APP_VERSION,
  BUILD_ID,
  calculateBMI,
  toLocalDateString,
} from "../../utils";
import {
  Button,
  Card,
  NumberInputDisplay,
  CuteCalendar,
} from "../UIComponents";
import { OFFICIAL_MASCOT_SRC } from "../../constants/mascot";

import { triggerHaptic } from '../../services/haptics';

interface SettingsViewProps {
  user: UserProfile;
  onSave: (u: UserProfile) => void;
  openKeypad: (
    initialValue: string,
    unit: string,
    onConfirm: (val: string) => void,
  ) => void;
  setView: (view: AppView) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onSave,
  openKeypad,
  setView,
}) => {
  const [nickname, setNickname] = React.useState(user.nickname || "");
  const [age, setAge] = React.useState<number | undefined>(user.age);
  const [height, setHeight] = React.useState(user.height);
  const [targetWeight, setTargetWeight] = React.useState(user.targetWeight || 0);
  const [isProfileSaved, setIsProfileSaved] = React.useState(false);

  const [gender, setGender] = React.useState<UserProfile["gender"]>(user.gender);
  const [activityLevel, setActivityLevel] = React.useState<
    UserProfile["activityLevel"]
  >(user.activityLevel);

  // テーマ設定
  const [theme, setTheme] = React.useState<"default" | "matte-blue">(
    user.theme || "default",
  );

  const [dietEnabled, setDietEnabled] = React.useState(
    user.dietMode?.enabled ?? false,
  );
  const [dietGoal, setDietGoal] = React.useState<
    NonNullable<UserProfile["dietMode"]>["goal"]
  >(user.dietMode?.goal ?? "maintain");
  const [dietIntensity, setDietIntensity] = React.useState<
    NonNullable<UserProfile["dietMode"]>["intensity"]
  >(user.dietMode?.intensity ?? "loose");
  const [dietTargetDate, setDietTargetDate] = React.useState<string | undefined>(
    user.dietMode?.targetDate,
  );

  const [isDietAccordionOpen, setIsDietAccordionOpen] = React.useState(false);

  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const handleSaveProfile = () => {
    onSave({
      ...user,
      nickname,
      age,
      height,
      targetWeight,
      gender,
      activityLevel,
      theme,
      dietMode: {
        enabled: dietEnabled,
        goal: dietGoal || "maintain",
        intensity: dietIntensity || "loose",
        targetDate: dietTargetDate,
      },
    });
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 2000);
  };

  const handleThemeChange = (newTheme: "default" | "matte-blue") => {
    setTheme(newTheme);
    // テーマは即時反映・自動保存
    onSave({
      ...user,
      nickname,
      age,
      height,
      targetWeight,
      gender,
      activityLevel,
      theme: newTheme,
      dietMode: {
        enabled: dietEnabled,
        goal: dietGoal || "maintain",
        intensity: dietIntensity || "loose",
        targetDate: dietTargetDate,
      },
    });
  };

  const SelectGroup = ({ label, options, value, onChange }: any) => (
    <div className="space-y-1">
      <label
        className="text-[10px] font-black ml-1 block uppercase tracking-wider opacity-50"
        style={{ color: THEME.colors.textPrimary }}
      >
        {label}
      </label>
      <div
        className="flex bg-stone-100 p-1 rounded-2xl border-2"
        style={{ borderColor: THEME.colors.border }}
      >
        {options.map((opt: any) => (
          <button
            key={String(opt.val)}
            onClick={() => { triggerHaptic(); onChange(opt.val); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 ${value === opt.val ? "bg-white shadow-sm" : "text-stone-400"}`}
            style={value === opt.val ? { color: THEME.colors.readPrimary } : {}}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full relative">
      {/* Background Mascot (Watermark) */}
      <div className="absolute bottom-[-5%] -right-12 w-72 h-72 opacity-[0.08] pointer-events-none z-0 rotate-[-15deg]">
        <img src={OFFICIAL_MASCOT_SRC} alt="" className="w-full h-full object-contain grayscale brightness-150" />
      </div>

      <main className="flex-1 space-y-6 mt-4 animate-in slide-in-from-bottom duration-300 relative z-10 will-change-transform">
        <div className="px-6 space-y-6">
          {/* 1. プロフィール */}
          <Card
            title="プロフィール"
            className="organic-card border-2 border-b-4"
            style={{ borderColor: THEME.colors.border }}
          >
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className="flex-[2]">
                  <label
                    className="text-[10px] font-black ml-1 mb-1 block uppercase tracking-wider"
                    style={{ color: THEME.colors.textLight }}
                  >
                    ニックネーム
                  </label>
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full p-3 rounded-xl font-black border-2 outline-none text-sm"
                    style={{
                      backgroundColor: THEME.colors.appBg,
                      borderColor: THEME.colors.border,
                    }}
                  />
                </div>
                <div className="flex-1">
                  <NumberInputDisplay
                    label="年齢"
                    value={age || "--"}
                    unit="歳"
                    onClick={() =>
                      openKeypad((age || "").toString(), "歳", (val) =>
                        setAge(parseInt(val) || undefined),
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <NumberInputDisplay
                  label="身長"
                  value={height}
                  unit="cm"
                  onClick={() =>
                    openKeypad(height.toString(), "cm", (val) =>
                      setHeight(parseFloat(val) || 0),
                    )
                  }
                />
                <NumberInputDisplay
                  label="目標体重"
                  value={targetWeight || 0}
                  unit="kg"
                  onClick={() =>
                    openKeypad((targetWeight || 0).toString(), "kg", (val) =>
                      setTargetWeight(parseFloat(val) || 0),
                    )
                  }
                />
              </div>

              {targetWeight > 0 &&
                height > 0 &&
                calculateBMI(height, targetWeight) < 18.5 && (
                  <div className="bg-[#FFF3E0] p-3 rounded-xl border border-[#FFE0B2] flex gap-2 items-start mt-[-4px] mb-2">
                    <AlertCircle
                      size={14}
                      className="text-[#F57C00] shrink-0 mt-0.5"
                    />
                    <p className="text-[9px] font-bold text-[#EF6C00]">
                      目標BMIが{" "}
                      <strong>{calculateBMI(height, targetWeight)}</strong>{" "}
                      (18.5未満) になります。
                      <br />
                      健康リスクを避けるため、極端な食事制限ではなく、運動を取り入れた体作りを意識しましょう。
                    </p>
                  </div>
                )}

              <Button
                onClick={handleSaveProfile}
                className="w-full min-h-[56px] h-auto text-base shadow-xl text-white py-3"
              >
                {isProfileSaved ? "保存完了！" : "プロフィールを保存"}
              </Button>
            </div>
          </Card>

          {/* 2. 目安計算の設定 */}
          <Card
            title="目安計算の設定"
            className="organic-card border-2 border-b-4"
            style={{ borderColor: THEME.colors.border }}
          >
            <div className="space-y-6">
              <SelectGroup
                label="性別"
                value={gender}
                onChange={setGender}
                options={[
                  { val: undefined, label: "未設定" },
                  { val: "female", label: "女性" },
                  { val: "male", label: "男性" },
                ]}
              />

              <div>
                <SelectGroup
                  label="普段の活動量"
                  value={activityLevel}
                  onChange={setActivityLevel}
                  options={[
                    { val: undefined, label: "未設定" },
                    { val: "low", label: "低い" },
                    { val: "normal", label: "ふつう" },
                    { val: "high", label: "高い" },
                  ]}
                />
                <p className="text-[9px] font-bold text-stone-400 mt-1 ml-1">
                  ※低い: 座り仕事中心 / ふつう: 立ち仕事・通勤 / 高い:
                  肉体労働・運動習慣あり
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => { triggerHaptic(); setIsDietAccordionOpen(!isDietAccordionOpen); }}
                  className={`w-full flex items-center justify-between p-4 rounded-[28px] border-2 border-b-4 active:scale-[0.98] transition-transform ${dietEnabled ? "bg-[#F0FAF5] border-[#7ED3AE] border-b-[#6BC99D]" : "bg-stone-50 border-stone-200 border-b-stone-300"}`}
                >
                  <div className="flex items-center gap-3 pointer-events-none">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${dietEnabled ? "bg-white" : "bg-stone-100"}`}
                    >
                      <Scale
                        size={20}
                        className={
                          dietEnabled ? "text-[#7ED3AE]" : "text-stone-400"
                        }
                      />
                    </div>
                    <div className="text-left">
                      <span
                        className={`block text-sm font-black ${dietEnabled ? "text-[#7ED3AE]" : "text-stone-600"}`}
                      >
                        ダイエットモード
                      </span>
                      <span className="text-[10px] font-bold text-stone-400">
                        {dietEnabled
                          ? "ON: 目標に合わせて目安を調整中"
                          : "OFF: 通常の目安を表示"}
                      </span>
                    </div>
                  </div>
                  {isDietAccordionOpen ? (
                    <ChevronUp size={20} className="text-stone-400" />
                  ) : (
                    <ChevronDown size={20} className="text-stone-400" />
                  )}
                </button>

                {isDietAccordionOpen && (
                  <div
                    className="mt-3 p-5 rounded-[28px] border-2 bg-white space-y-5 animate-in slide-in-from-top-2 shadow-sm will-change-transform"
                    style={{ borderColor: THEME.colors.border }}
                  >
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-black text-stone-600">
                        モードを有効にする
                      </span>
                      <button
                        onClick={() => { triggerHaptic(); setDietEnabled(!dietEnabled); }}
                        className={`w-14 h-8 rounded-full transition-colors relative shadow-inner active:scale-90 ${dietEnabled ? "bg-readPrimary" : "bg-stone-200"}`}
                        style={
                          dietEnabled
                            ? { backgroundColor: THEME.colors.readPrimary }
                            : {}
                        }
                      >
                        <div
                          className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${dietEnabled ? "left-7" : "left-1"}`}
                        />
                      </button>
                    </div>

                    {dietEnabled && (
                      <div className="space-y-5 pt-2 border-t border-dashed border-stone-100">
                        <SelectGroup
                          label="目標"
                          value={dietGoal}
                          onChange={setDietGoal}
                          options={[
                            { val: "loss", label: "減量" },
                            { val: "maintain", label: "維持" },
                            { val: "gain", label: "増量" },
                          ]}
                        />

                        <SelectGroup
                          label="ペース (強さ)"
                          value={dietIntensity}
                          onChange={setDietIntensity}
                          options={[
                            { val: "loose", label: "ゆるめ" },
                            { val: "strict", label: "しっかり" },
                          ]}
                        />

                        <div
                          onClick={() => { triggerHaptic(); setCalendarOpen(true); }}
                          className="cursor-pointer group space-y-1 active:scale-[0.98] transition-transform duration-150"
                        >
                          <label
                            className="text-[10px] font-black ml-1 mb-1 block uppercase tracking-wider opacity-50"
                            style={{ color: THEME.colors.textPrimary }}
                          >
                            目標日
                          </label>
                          <div
                            className="w-full p-4 rounded-2xl font-black border-2 flex items-center justify-between transition-all shadow-inner bg-stone-50"
                            style={{
                              borderColor: THEME.colors.border,
                              color: THEME.colors.textPrimary,
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <CalendarClock
                                size={20}
                                className="text-stone-400"
                              />
                              <span className="text-sm">
                                {dietTargetDate || "設定する"}
                              </span>
                            </div>
                            <ChevronDown size={18} className="text-stone-300" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                onClick={handleSaveProfile}
                className="w-full min-h-[56px] h-auto text-base shadow-xl text-white py-3"
              >
                {isProfileSaved ? "保存完了！" : "計算設定を保存"}
              </Button>
            </div>
          </Card>

          {/* 3. アプリの見た目・操作感 */}
          <Card
            title="アプリの見た目・操作感"
            className="organic-card border-2 border-b-4"
            style={{ borderColor: THEME.colors.border }}
          >
            <div className="space-y-6">
              <div>
                <SelectGroup
                  label="テーマカラー"
                  value={theme}
                  onChange={handleThemeChange}
                  options={[
                    { val: "default", label: "標準 (ピンク)" },
                    { val: "matte-blue", label: "マットブルー" },
                  ]}
                />
                <p className="text-[9px] font-bold text-stone-400 mt-2 ml-1">
                  ※テーマを変更するとすぐに反映されます。
                </p>
              </div>

              <div className="pt-2 border-t border-dashed border-stone-200">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <span className="text-xs font-black text-stone-600 block">
                      バイブ機能
                    </span>
                    <span className="text-[10px] font-bold text-stone-400">
                      ボタン操作時の軽い振動
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !(user.hapticsEnabled ?? true);
                      if (!newValue) {
                        // OFFにする直前だけ1回振動させる
                        triggerHaptic();
                      }
                      onSave({ ...user, hapticsEnabled: newValue });
                      if (newValue) {
                         // ONにした直後も1回振動させる
                         setTimeout(() => triggerHaptic(), 50);
                      }
                    }}
                    className={`w-14 h-8 rounded-full transition-colors relative shadow-inner active:scale-90 ${(user.hapticsEnabled ?? true) ? "bg-readPrimary" : "bg-stone-200"}`}
                    style={(user.hapticsEnabled ?? true) ? { backgroundColor: THEME.colors.readPrimary } : {}}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${(user.hapticsEnabled ?? true) ? "left-7" : "left-1"}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* 4. データと安心 */}
          <Card
            title="データと安心・バックアップ"
            className="organic-card border-2 border-b-4"
            style={{ borderColor: THEME.colors.border }}
          >
            <div className="space-y-6">
              <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200 space-y-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <ShieldAlert size={18} />
                  <h4 className="text-xs font-black">データの保存について</h4>
                </div>
                <p className="text-[10px] font-bold text-amber-800 leading-relaxed">
                  「たべとっと。」のデータは、プライバシー保護のため<strong className="underline">お客様の端末内にのみ</strong>保存されています。
                  <br /><br />
                  以下の点にご注意ください：
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[10px] font-bold text-amber-900">
                    <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>アプリを削除すると、すべての記録が消去されます。</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] font-bold text-amber-900">
                    <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>機種変更時のデータ移行機能はありません。</span>
                  </li>
                  <li className="flex items-start gap-2 text-[10px] font-bold text-amber-900">
                    <div className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>大切な記録は「共有」ボタンから画像として保存しておくことをお勧めします。</span>
                  </li>
                </ul>
                <div className="pt-2">
                   <button 
                     onClick={() => { triggerHaptic(); setView(AppView.TERMS); }}
                     className="text-[10px] font-black underline text-amber-600 active:opacity-50"
                   >
                     詳細な注意事項を確認する
                   </button>
                </div>
              </div>

              <div className="text-[10px] font-bold text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <p className="flex items-start gap-2">
                  <AlertCircle
                    size={14}
                    className="shrink-0 mt-0.5 text-stone-400"
                  />
                  <span>
                    写真データの自動整理について
                    <br />
                    端末の容量を節約するため、10日以上経過した食事写真と、比較基準に設定されていない姿勢写真は自動的に削除されます（解析結果のテキストデータは残ります）。
                  </span>
                </p>
              </div>

              <div
                className="space-y-3 text-[11px] font-bold leading-relaxed"
                style={{ color: THEME.colors.textLight }}
              >
                <p>
                  「たべとっと。」は、ガチガチの管理ではなく、ゆるく使ってほしいアプリです。
                </p>
                <div
                  className="p-4 rounded-2xl border-2 border-dashed space-y-3 bg-white"
                  style={{ borderColor: THEME.colors.border }}
                >
                  <h4
                    className="text-xs font-black"
                    style={{ color: THEME.colors.textPrimary }}
                  >
                    免責事項
                  </h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>分析結果は参考情報であり、正確性を保証しません。</li>
                    <li>本アプリは医療行為/診断を行いません。</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="pt-6 pb-72 text-center space-y-1 relative">
          <div className="flex justify-center mb-4 opacity-50">
            <img
              src="/tabetotto.mascot.svg"
              alt=""
              className="w-16 h-16 object-contain animate-sway"
            />
          </div>
          <p
            className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: THEME.colors.textLight }}
          >
            Version {APP_VERSION}
          </p>
          <p
            className="text-[8px] font-mono opacity-30"
            style={{ color: THEME.colors.textLight }}
          >
            BUILD: {BUILD_ID}
          </p>
        </div>
      </main>

      {calendarOpen && (
        <CuteCalendar
          initialDate={dietTargetDate || toLocalDateString()}
          onConfirm={(d) => {
            setDietTargetDate(d);
            setCalendarOpen(false);
          }}
          onCancel={() => setCalendarOpen(false)}
        />
      )}
    </div>
  );
};

export default SettingsView;
