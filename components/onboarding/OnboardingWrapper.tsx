
import { useState } from 'react';
import { Button, Modal } from '../../components/UIComponents';
import { setOnboardingFlags } from '../../services/onboardingService';

// 導入3枚のUI
const Introduction = ({ onNext, onSkip }: { onNext: () => void, onSkip: () => void }) => {
    const [page, setPage] = useState(0);
    const slides = [
        { title: "写真でも、手入力でも記録できます", body: "たべとっと。は、食事をゆるく記録して続けるためのアプリです。" },
        { title: "記録はこの端末内に保存されます", body: "記録は、この端末やブラウザ内に保存されます。" },
        { title: "ホーム画面に追加がおすすめ", body: "ホーム画面に追加すると、すぐ開けて便利です。" }
    ];

    return (
        <div className="flex flex-col items-center p-6 space-y-6">
            <h2 className="text-xl font-black text-stone-700">{slides[page].title}</h2>
            <p className="text-sm font-bold text-stone-500 whitespace-pre-line text-center">{slides[page].body}</p>
            <div className="flex gap-2">
                {slides.map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i === page ? 'bg-primary' : 'bg-stone-200'}`} />)}
            </div>
            {page < slides.length - 1 ? (
                <Button onClick={() => setPage(page + 1)} className="w-full">次へ</Button>
            ) : (
                <Button onClick={onNext} className="w-full">はじめる</Button>
            )}
            <button onClick={onSkip} className="text-xs font-bold text-stone-400">スキップ</button>
        </div>
    );
};

import { InitialSetupFlow, InitialSetupData } from './InitialSetupFlow';
// ...
export const OnboardingWrapper = ({ onFinished, onSaveSetup, onSkip }: { 
    onFinished: () => void,
    onSaveSetup: (data: InitialSetupData) => void,
    onSkip: () => void
}) => {
    const [phase, setPhase] = useState<'intro' | 'setup'>('intro');

    return (
        <Modal isOpen={true} onClose={() => {}}>
            {phase === 'intro' ? (
                <Introduction onNext={() => setPhase('setup')} onSkip={onSkip} />
            ) : (
                <InitialSetupFlow onComplete={(data) => {
                    onSaveSetup(data);
                    setOnboardingFlags({ hasSeenOnboarding: true, hasCompletedInitialSetup: true });
                    onFinished();
                }} />
            )}
        </Modal>
    );
};
