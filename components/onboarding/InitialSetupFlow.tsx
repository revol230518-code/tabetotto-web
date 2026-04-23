
import { useState } from 'react';
import { Button } from '../UIComponents';
import { User, Activity, Ruler } from 'lucide-react';

export interface InitialSetupData {
    nickname: string;
    gender: 'female' | 'male';
    age: number;
    height: number;
    weight: number;
    targetWeight: number;
    activityLevel: 'low' | 'normal' | 'high';
}

export const InitialSetupFlow = ({ onComplete }: { onComplete: (data: InitialSetupData) => void }) => {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<InitialSetupData>({
        nickname: '',
        gender: 'female',
        age: 30,
        height: 160,
        weight: 60,
        targetWeight: 55,
        activityLevel: 'normal'
    });

    return (
        <div className="p-6 space-y-6">
            <p className="text-[10px] text-center text-stone-400">あとで設定から変更できます</p>
            {step === 0 && (
                <>
                    <h2 className="text-xl font-black text-stone-700 flex items-center gap-2"><User size={20}/> 基本情報を教えてください</h2>
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-stone-600">ニックネーム</label>
                        <input type="text" className="w-full p-3 border rounded-xl" value={data.nickname} onChange={e => setData({...data, nickname: e.target.value})} placeholder="例: たべとっと" />
                        <label className="block text-sm font-bold text-stone-600">性別</label>
                        <select className="w-full p-3 border rounded-xl" value={data.gender} onChange={e => setData({...data, gender: e.target.value as 'female' | 'male'})}>
                            <option value="female">女性</option>
                            <option value="male">男性</option>
                        </select>
                        <label className="block text-sm font-bold text-stone-600">年齢</label>
                        <input type="number" className="w-full p-3 border rounded-xl" value={data.age} onChange={e => setData({...data, age: parseInt(e.target.value)})} />
                    </div>
                    <Button onClick={() => setStep(1)} className="w-full">次へ</Button>
                </>
            )}
            
            {step === 1 && (
                <>
                    <h2 className="text-xl font-black text-stone-700 flex items-center gap-2"><Ruler size={20}/> 体の情報を入れましょう</h2>
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-stone-600">身長 (cm)</label>
                        <input type="number" className="w-full p-3 border rounded-xl" value={data.height} onChange={e => setData({...data, height: parseInt(e.target.value)})} />
                        <label className="block text-sm font-bold text-stone-600">現在体重 (kg)</label>
                        <input type="number" className="w-full p-3 border rounded-xl" value={data.weight} onChange={e => setData({...data, weight: parseInt(e.target.value)})} />
                        <label className="block text-sm font-bold text-stone-600">目標体重 (kg)</label>
                        <input type="number" className="w-full p-3 border rounded-xl" value={data.targetWeight} onChange={e => setData({...data, targetWeight: parseInt(e.target.value)})} />
                    </div>
                    <Button onClick={() => setStep(2)} className="w-full">次へ</Button>
                </>
            )}

            {step === 2 && (
                <>
                    <h2 className="text-xl font-black text-stone-700 flex items-center gap-2"><Activity size={20}/> 活動レベルは？</h2>
                    <div className="space-y-2">
                        {[
                            { value: 'low', label: '座り仕事中心' },
                            { value: 'normal', label: 'ふつう' },
                            { value: 'high', label: 'よく動く' }
                        ].map(o => (
                            <button key={o.value} className={`w-full p-3 border rounded-xl font-bold ${data.activityLevel === o.value ? 'bg-primary text-white' : 'bg-stone-50'}`} onClick={() => setData({...data, activityLevel: o.value as 'low' | 'normal' | 'high'})}>
                                {o.label}
                            </button>
                        ))}
                    </div>
                    <Button onClick={() => onComplete(data)} className="w-full">準備できました！</Button>
                </>
            )}
        </div>
    );
};
