
/**
 * たべとっと。 キャラクター生成サービス (v6.6 なすリファイン版)
 * Cloud Run / Gemini への依存を排除し、完全オフラインで動作します。
 * なすの色味（淡い紫・緑のヘタ）を調整。
 */

// 擬似乱数生成器 (Mulberry32)
function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

// 文字列から32bitシードを生成 (MurmurHash3風)
function cyrb128(str: string) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return (h1^h2^h3^h4) >>> 0;
}

// モチーフ定義
type BodyType = 
    'round' | 'square' | 'egg' | 
    'onigiri' | 'rice' | 
    'bread' | 'sandwich' | 'hamburger' | 'anpan' |
    'strawberry' | 'melon' | 'watermelon' | 'apple' | 'peach' | 'mandarin' |
    'potato' | 'mushroom' | 'broccoli' | 'carrot' | 'eggplant' | 'daikon' | 'bean' | 'turnip' | 'pumpkin' | 'manju';

export type MascotCondition = 'normal' | 'tired' | 'fat' | 'hungry';

// 色をくすませるヘルパー
const desaturate = (hex: string, ratio: number = 0.5): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const nr = Math.floor(r * (1 - ratio) + 128 * ratio);
    const ng = Math.floor(g * (1 - ratio) + 128 * ratio);
    const nb = Math.floor(b * (1 - ratio) + 128 * ratio);
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
};

// プロンプトからボディタイプを推定
const detectBodyType = (random: () => number): BodyType => {
    const types: BodyType[] = [
        'round', 'square', 'egg', 
        'onigiri', 'rice', 
        'bread', 'sandwich', 'hamburger', 'anpan',
        'strawberry', 'melon', 'watermelon', 'apple', 'peach', 'mandarin',
        'potato', 'mushroom', 'broccoli', 'carrot', 'eggplant', 'daikon', 'bean', 'turnip', 'pumpkin', 'manju'
    ];
    return types[Math.floor(random() * types.length)];
};

export const generateMascot = async (customPrompt: string, condition: MascotCondition = 'normal'): Promise<string> => {
  try {
    const width = 512;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error("画像生成エンジンの初期化に失敗しました。");

    // シード決定
    const seed = customPrompt ? cyrb128(customPrompt) : Math.floor(Math.random() * 0xFFFFFFFF);
    const random = mulberry32(seed);

    // ボディタイプ決定
    const bodyType = detectBodyType(random);

    // パーツ・バリエーション決定
    const randEyeType = Math.floor(random() * 15);
    const randMouthType = Math.floor(random() * 10);
    
    // 顔のアクセサリー（眼鏡など）
    const randFaceAccVal = random();
    const hasFaceAcc = randFaceAccVal < 0.35; 
    const randFaceAccType = Math.floor(random() * 4); // 0:丸メガネ, 1:四角メガネ, 2:サングラス, 3:黒丸メガネ

    const randAccType = Math.floor(random() * 5);
    const randAccColorIdx = Math.floor(random() * 7);
    const randItemType = Math.floor(random() * 3);
    const randAccVis = random();
    const randSubVar = random(); 

    // --- パレット定義 ---
    const accColors = ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#957DAD', '#D291BC'];
    let currentAccColor = accColors[randAccColorIdx];

    // 1. 背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;

    // 2. 影
    ctx.save();
    if (condition === 'fat') {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 170, 150, 40, 0, 0, Math.PI * 2);
    } else {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 160, 120, 30, 0, 0, Math.PI * 2);
    }
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fill();
    ctx.restore();

    // --- 状態変化の適用 (トランスフォーム) ---
    ctx.save();
    
    if (condition === 'fat') {
        ctx.translate(centerX, centerY);
        ctx.scale(1.25, 0.85);
        ctx.translate(-centerX, -centerY + 30);
    } else if (condition === 'tired' || condition === 'hungry') {
        ctx.translate(centerX, centerY);
        ctx.scale(0.95, 0.95);
        if (condition === 'hungry') {
            ctx.rotate(-0.05); 
            ctx.translate(-centerX, -centerY + 30);
        } else {
            ctx.translate(-centerX, -centerY + 20);
        }
    }

    // 共通スタイル
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#6B7280';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 3. ボディ描画
    const getColor = (hex: string) => condition === 'tired' ? desaturate(hex, 0.6) : hex;

    // --- ボディ描画ロジック ---
    if (bodyType === 'carrot') {
        // にんじん (丸みのあるかわいい形状)
        ctx.fillStyle = getColor('#FF9F43');
        ctx.beginPath();
        ctx.moveTo(centerX - 75, centerY - 130);
        ctx.quadraticCurveTo(centerX, centerY - 140, centerX + 75, centerY - 130);
        ctx.bezierCurveTo(centerX + 90, centerY, centerX + 40, centerY + 160, centerX, centerY + 200);
        ctx.bezierCurveTo(centerX - 40, centerY + 160, centerX - 90, centerY, centerX - 75, centerY - 130);
        ctx.fill(); ctx.stroke();
        
        // 葉っぱ
        ctx.fillStyle = getColor('#2ECC71');
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 150, 15, 30, 0, 0, Math.PI*2);
        ctx.moveTo(centerX - 10, centerY - 130);
        ctx.ellipse(centerX - 25, centerY - 145, 15, 25, -0.5, 0, Math.PI*2);
        ctx.moveTo(centerX + 10, centerY - 130);
        ctx.ellipse(centerX + 25, centerY - 145, 15, 25, 0.5, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
        
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath(); ctx.moveTo(centerX+30, centerY-80); ctx.quadraticCurveTo(centerX+45, centerY-80, centerX+60, centerY-75); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(centerX-60, centerY); ctx.quadraticCurveTo(centerX-40, centerY+5, centerX-20, centerY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(centerX+20, centerY+90); ctx.quadraticCurveTo(centerX+35, centerY+90, centerX+50, centerY+95); ctx.stroke();

    } else if (bodyType === 'sandwich') {
        // サンドイッチ (具材感アップ)
        const size = 140;
        
        // パン (中身)
        ctx.fillStyle = '#FFF5E1'; 
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size); 
        ctx.lineTo(centerX + size, centerY + size); 
        ctx.lineTo(centerX - size, centerY + size); 
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 具材: レタス
        ctx.fillStyle = getColor('#A7D7C5');
        ctx.beginPath();
        ctx.moveTo(centerX - size + 10, centerY + size);
        for(let i=0; i<8; i++) {
            const sx = centerX - size + 20 + i*35;
            ctx.quadraticCurveTo(sx, centerY + size + 15 * (i%2 ? 1 : -1), sx + 15, centerY + size);
        }
        ctx.lineTo(centerX + size - 10, centerY + size);
        ctx.fill(); 

        // 具材: ハム/チーズ
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#FFB7B2'; // ハム
        ctx.beginPath();
        ctx.moveTo(centerX - size + 30, centerY + size - 10);
        ctx.lineTo(centerX + size - 30, centerY + size - 10);
        ctx.stroke();
        
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#FFD93D'; // チーズ
        ctx.beginPath();
        ctx.moveTo(centerX - size + 40, centerY + size - 25);
        ctx.lineTo(centerX + size - 40, centerY + size - 25);
        ctx.stroke();

        ctx.lineWidth = 8;
        ctx.strokeStyle = '#6B7280';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX + size, centerY + size);
        ctx.lineTo(centerX - size, centerY + size);
        ctx.closePath();
        ctx.stroke();
       
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY + size);
        ctx.lineTo(centerX, centerY - size);
        ctx.lineTo(centerX + size, centerY + size);
        ctx.stroke();

    } else if (bodyType === 'mushroom') {
        // きのこ (リファイン版: 角なし・茶色系)
        
        // 柄 (太めで丸い)
        ctx.fillStyle = '#FFF8E1'; 
        ctx.beginPath();
        const stemW = 100;
        const stemH = 140;
        const stemX = centerX - stemW / 2;
        const stemY = centerY - 20; 
        ctx.roundRect(stemX, stemY, stemW, stemH, 50); 
        ctx.fill(); ctx.stroke();

        // カサ (茶色で美味しそうに)
        ctx.fillStyle = getColor('#A1887F'); // ミルクココア色
        ctx.beginPath();
        ctx.moveTo(centerX - 140, centerY + 20);
        ctx.bezierCurveTo(centerX - 160, centerY - 180, centerX + 160, centerY - 180, centerX + 140, centerY + 20);
        ctx.quadraticCurveTo(centerX, centerY + 50, centerX - 140, centerY + 20);
        ctx.fill(); ctx.stroke();
        
        // カサのアクセント
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.ellipse(centerX + 60, centerY - 80, 20, 10, -0.5, 0, Math.PI*2);
        ctx.fill();

    } else if (bodyType === 'eggplant') {
        // なす (淡い紫、緑のヘタ)
        ctx.fillStyle = getColor('#BE93C5'); // 淡い紫
        ctx.beginPath();
        ctx.moveTo(centerX - 20, centerY - 140);
        ctx.bezierCurveTo(centerX - 120, centerY - 100, centerX - 120, centerY + 150, centerX - 30, centerY + 180);
        ctx.quadraticCurveTo(centerX, centerY + 190, centerX + 30, centerY + 180);
        ctx.bezierCurveTo(centerX + 120, centerY + 150, centerX + 120, centerY - 100, centerX + 20, centerY - 140);
        ctx.fill(); ctx.stroke();
        
        // ヘタ (鮮やかな緑)
        ctx.fillStyle = getColor('#27AE60'); 
        ctx.beginPath();
        ctx.moveTo(centerX - 30, centerY - 140);
        ctx.quadraticCurveTo(centerX, centerY - 170, centerX + 30, centerY - 140);
        ctx.lineTo(centerX + 50, centerY - 100);
        ctx.lineTo(centerX, centerY - 120);
        ctx.lineTo(centerX - 50, centerY - 100);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

    } else if (bodyType === 'mandarin') {
        ctx.fillStyle = getColor('#FF9F43');
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 20, 150, 130, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = getColor('#76C893');
        ctx.beginPath(); ctx.arc(centerX, centerY - 110, 10, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        [[-80,0], [80,40], [0,80], [-50,-50]].forEach(p => {
            ctx.beginPath(); ctx.arc(centerX+p[0], centerY+p[1]+20, 3, 0, Math.PI*2); ctx.fill();
        });

    } else if (bodyType === 'daikon') {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.moveTo(centerX - 60, centerY - 120);
        ctx.lineTo(centerX - 40, centerY + 150);
        ctx.quadraticCurveTo(centerX, centerY + 220, centerX + 40, centerY + 150);
        ctx.lineTo(centerX + 60, centerY - 120);
        ctx.quadraticCurveTo(centerX, centerY - 130, centerX - 60, centerY - 120);
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = 'rgba(181, 234, 215, 0.5)';
        ctx.beginPath();
        ctx.rect(centerX - 58, centerY - 120, 116, 60);
        ctx.fill();

        ctx.fillStyle = getColor('#76C893');
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 125);
        ctx.quadraticCurveTo(centerX - 50, centerY - 200, centerX - 80, centerY - 180);
        ctx.quadraticCurveTo(centerX - 40, centerY - 160, centerX, centerY - 125);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 125);
        ctx.quadraticCurveTo(centerX + 50, centerY - 200, centerX + 80, centerY - 180);
        ctx.quadraticCurveTo(centerX + 40, centerY - 160, centerX, centerY - 125);
        ctx.fill(); ctx.stroke();

    } else if (bodyType === 'bean') {
        ctx.fillStyle = getColor('#A7D7C5');
        ctx.beginPath();
        ctx.moveTo(centerX - 20, centerY - 160);
        ctx.bezierCurveTo(centerX + 80, centerY - 100, centerX + 80, centerY + 100, centerX - 20, centerY + 180);
        ctx.bezierCurveTo(centerX - 100, centerY + 100, centerX - 100, centerY - 100, centerX - 20, centerY - 160);
        ctx.fill(); ctx.stroke();
        
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.beginPath(); ctx.arc(centerX - 10, centerY - 80, 20, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(centerX - 10, centerY, 25, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(centerX - 10, centerY + 80, 20, 0, Math.PI*2); ctx.stroke();

    } else if (bodyType === 'turnip') {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(centerX, centerY + 40, 110, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = getColor('#76C893');
        ctx.beginPath();
        ctx.rect(centerX - 15, centerY - 80, 30, 40);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(centerX - 40, centerY - 120, 20, 50, -0.5, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(centerX + 40, centerY - 120, 20, 50, 0.5, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();

    } else if (bodyType === 'pumpkin') {
        ctx.fillStyle = getColor('#E67E22');
        ctx.beginPath(); ctx.ellipse(centerX - 60, centerY + 20, 70, 110, -0.1, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(centerX + 60, centerY + 20, 70, 110, 0.1, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(centerX, centerY + 20, 80, 120, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = '#2C5F2D';
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY - 100);
        ctx.lineTo(centerX - 15, centerY - 140);
        ctx.lineTo(centerX + 15, centerY - 140);
        ctx.lineTo(centerX + 10, centerY - 100);
        ctx.fill(); ctx.stroke();

    } else if (bodyType === 'rice') {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 100, 160, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        
        if (randSubVar > 0.5) {
            ctx.fillStyle = '#E0E0E0';
            ctx.beginPath();
            ctx.ellipse(centerX + 60, centerY - 100, 20, 30, 0.5, 0, Math.PI*2);
            ctx.fill();
        }

    } else if (bodyType === 'bread') {
        ctx.fillStyle = '#FDF5E6'; 
        ctx.beginPath();
        ctx.moveTo(centerX - 120, centerY - 100);
        ctx.quadraticCurveTo(centerX - 60, centerY - 180, centerX, centerY - 120);
        ctx.quadraticCurveTo(centerX + 60, centerY - 180, centerX + 120, centerY - 100);
        ctx.lineTo(centerX + 120, centerY + 140);
        ctx.lineTo(centerX - 120, centerY + 140);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 10;
        ctx.stroke();

    } else if (bodyType === 'anpan') {
        ctx.fillStyle = getColor('#D35400');
        ctx.beginPath();
        ctx.arc(centerX, centerY, 130, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = '#F5CBA7';
        for(let i=0; i<5; i++) {
            ctx.beginPath();
            ctx.arc(centerX + (Math.random()*40-20), centerY - 80 + (Math.random()*20), 3, 0, Math.PI*2);
            ctx.fill();
        }

    } else if (bodyType === 'manju') {
        const colors = ['#FFFFFF', '#FFD1DC', '#8D6E63'];
        ctx.fillStyle = getColor(colors[Math.floor(random() * colors.length)]);
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 20, 140, 110, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.beginPath();
        ctx.ellipse(centerX - 50, centerY - 40, 30, 15, -0.2, 0, Math.PI*2);
        ctx.fill();

    } else if (bodyType === 'onigiri') {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        const size = 160;
        ctx.moveTo(centerX, centerY - size + 20);
        ctx.quadraticCurveTo(centerX + size + 20, centerY + size - 40, centerX + size, centerY + size);
        ctx.quadraticCurveTo(centerX, centerY + size + 30, centerX - size, centerY + size);
        ctx.quadraticCurveTo(centerX - size - 20, centerY + size - 40, centerX, centerY - size + 20);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#2C3E50';
        if (randSubVar < 0.3) {
            ctx.beginPath(); ctx.rect(centerX - 60, centerY + 80, 120, 80); ctx.fill();
        } else if (randSubVar < 0.6) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY - 60);
            ctx.lineTo(centerX + 80, centerY + 140);
            ctx.lineTo(centerX - 80, centerY + 140);
            ctx.fill();
        } else if (randSubVar < 0.9) {
            ctx.fillStyle = '#E74C3C';
            ctx.beginPath(); ctx.arc(centerX, centerY, 30, 0, Math.PI*2); ctx.fill();
        }

    } else if (bodyType === 'apple') {
         ctx.fillStyle = getColor('#FF6B6B');
         ctx.beginPath();
         ctx.moveTo(centerX, centerY - 120);
         ctx.bezierCurveTo(centerX - 180, centerY - 160, centerX - 180, centerY + 80, centerX, centerY + 160);
         ctx.bezierCurveTo(centerX + 180, centerY + 80, centerX + 180, centerY - 160, centerX, centerY - 120);
         ctx.fill(); ctx.stroke();
         ctx.fillStyle = getColor('#A7D7C5');
         ctx.beginPath(); ctx.ellipse(centerX+20, centerY-130, 20, 10, -0.5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    }
    else if (bodyType === 'peach') {
        ctx.fillStyle = getColor('#FFB7B2');
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 100);
        ctx.bezierCurveTo(centerX - 170, centerY - 140, centerX - 170, centerY + 60, centerX, centerY + 160);
        ctx.bezierCurveTo(centerX + 170, centerY + 60, centerX + 170, centerY - 140, centerX, centerY - 100);
        ctx.fill(); ctx.stroke();
    }
    else if (bodyType === 'broccoli') {
        ctx.fillStyle = getColor('#76C893');
        [[-40,-40], [40,-40], [0,-80], [-30,20], [30,20]].forEach(p => {
            ctx.beginPath(); ctx.arc(centerX+p[0], centerY+p[1], 50, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        });
        ctx.fillStyle = getColor('#A7D7C5'); // 茎
        ctx.beginPath(); ctx.rect(centerX-30, centerY+20, 60, 100); ctx.fill(); ctx.stroke();
    }
    else if (bodyType === 'potato') {
        ctx.fillStyle = getColor('#F5DEB3');
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 130, 110, 0.2, 0, Math.PI*2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        [[-40,-30], [50,40], [20,-50]].forEach(p => { ctx.beginPath(); ctx.arc(centerX+p[0], centerY+p[1], 4, 0, Math.PI*2); ctx.fill(); });
    }
    else if (bodyType === 'strawberry') {
        ctx.fillStyle = getColor('#FF9AA2');
        ctx.beginPath();
        ctx.moveTo(centerX - 120, centerY - 80);
        ctx.quadraticCurveTo(centerX, centerY + 220, centerX + 120, centerY - 80);
        ctx.quadraticCurveTo(centerX, centerY - 120, centerX - 120, centerY - 80);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = getColor('#B5EAD7'); // ヘタ
        ctx.beginPath(); ctx.moveTo(centerX-60, centerY-90); ctx.lineTo(centerX, centerY-60); ctx.lineTo(centerX+60, centerY-90); ctx.lineTo(centerX, centerY-110); ctx.fill(); ctx.stroke();
    }
    else if (bodyType === 'melon') {
        ctx.fillStyle = getColor('#B5EAD7');
        ctx.beginPath(); ctx.arc(centerX, centerY, 140, 0, Math.PI*2); ctx.fill(); 
        ctx.strokeStyle = '#FFF'; ctx.lineWidth = 2; // 網目
        for(let i=-2; i<=2; i++) { ctx.beginPath(); ctx.ellipse(centerX, centerY, 140-Math.abs(i*30), 140, 0, 0, Math.PI*2); ctx.stroke(); }
        for(let i=-2; i<=2; i++) { ctx.beginPath(); ctx.ellipse(centerX, centerY, 140, 140-Math.abs(i*30), Math.PI/2, 0, Math.PI*2); ctx.stroke(); }
        ctx.strokeStyle = '#6B7280'; ctx.lineWidth = 8; ctx.stroke();
    }
    else if (bodyType === 'watermelon') {
        ctx.fillStyle = getColor('#A7D7C5');
        ctx.beginPath(); ctx.arc(centerX, centerY, 140, 0, Math.PI*2); ctx.fill(); 
        ctx.fillStyle = '#2C5F2D'; // 縞模様
        [-60, 0, 60].forEach(x => { ctx.beginPath(); ctx.ellipse(centerX+x, centerY, 10, 140, 0, 0, Math.PI*2); ctx.fill(); });
        ctx.stroke();
    }
    else if (bodyType === 'hamburger') {
        // ハンバーガー (具材積み上げ)
        const bunColor = '#F4D03F';
        const meatColor = '#8D6E63';
        const cheeseColor = '#FFD93D';
        const lettuceColor = getColor('#A7D7C5');
        const tomatoColor = getColor('#FF6B6B');

        // 下から順に描画 (重なり順序を考慮)

        // 下バンズ
        ctx.fillStyle = bunColor;
        ctx.beginPath();
        ctx.moveTo(centerX - 120, centerY + 80);
        ctx.quadraticCurveTo(centerX, centerY + 130, centerX + 120, centerY + 80); // 底のカーブ
        ctx.lineTo(centerX + 120, centerY + 40);
        ctx.lineTo(centerX - 120, centerY + 40);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // パティ (肉)
        ctx.fillStyle = meatColor;
        ctx.beginPath();
        ctx.roundRect(centerX - 130, centerY + 10, 260, 40, 15);
        ctx.fill(); ctx.stroke();

        // チーズ (垂れる表現)
        ctx.fillStyle = cheeseColor;
        ctx.beginPath();
        ctx.moveTo(centerX - 125, centerY + 20);
        ctx.lineTo(centerX + 125, centerY + 20);
        ctx.lineTo(centerX + 125, centerY);
        // 垂れる部分
        ctx.lineTo(centerX + 80, centerY);
        ctx.lineTo(centerX + 60, centerY + 30); // 垂れ1
        ctx.lineTo(centerX + 40, centerY);
        ctx.lineTo(centerX - 20, centerY);
        ctx.lineTo(centerX - 40, centerY + 25); // 垂れ2
        ctx.lineTo(centerX - 60, centerY);
        ctx.lineTo(centerX - 125, centerY);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // トマト
        ctx.fillStyle = tomatoColor;
        ctx.beginPath();
        ctx.roundRect(centerX - 115, centerY - 20, 230, 25, 10);
        ctx.fill(); ctx.stroke();

        // レタス (波々)
        ctx.fillStyle = lettuceColor;
        ctx.beginPath();
        const lettuceWidth = 250;
        const startX = centerX - lettuceWidth / 2;
        const lettuceY = centerY - 20;
        ctx.moveTo(startX, lettuceY);
        for(let i=0; i<10; i++) {
             // 波を描く
             const x = startX + (lettuceWidth/10) * i;
             ctx.quadraticCurveTo(x + 10, lettuceY - 15, x + 25, lettuceY);
        }
        ctx.lineTo(centerX + lettuceWidth/2, lettuceY + 10);
        ctx.lineTo(startX, lettuceY + 10);
        ctx.fill(); ctx.stroke();

        // 上バンズ
        ctx.fillStyle = bunColor;
        ctx.beginPath();
        ctx.moveTo(centerX - 130, centerY - 15);
        ctx.bezierCurveTo(centerX - 130, centerY - 160, centerX + 130, centerY - 160, centerX + 130, centerY - 15);
        ctx.lineTo(centerX - 130, centerY - 15);
        ctx.fill(); ctx.stroke();

        // ごま
        ctx.fillStyle = '#FDF5E6';
        const seedPositions = [[-40, -100], [40, -90], [0, -120], [-60, -70], [60, -60], [20, -80]];
        seedPositions.forEach(p => {
            ctx.beginPath();
            ctx.ellipse(centerX + p[0], centerY + p[1], 4, 2, Math.random(), 0, Math.PI*2);
            ctx.fill();
        });
    } else {
        // Default Round/Square/Egg
        const colors = ['#FFD1DC', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#FFF5BA'];
        const color = getColor(colors[Math.floor(random() * colors.length)]);
        ctx.fillStyle = color;
        
        ctx.beginPath();
        if (bodyType === 'round') {
            ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
        } else if (bodyType === 'egg') {
            ctx.ellipse(centerX, centerY + 20, 145, 165, 0, 0, Math.PI * 2);
        } else {
            ctx.roundRect(centerX - 140, centerY - 140, 280, 280, 60);
        }
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore(); // ボディ変形の復元

    // 4. 顔 (ボディの上に描画)
    // 形状ごとのレイアウト補正 (Yオフセットとパーツ間隔スケール)
    let faceConfig = { yOffset: 0, xScale: 1.0 };

    switch(bodyType) {
        case 'carrot': faceConfig = { yOffset: -30, xScale: 0.9 }; break; // 上部の太い部分に寄せる
        case 'eggplant': faceConfig = { yOffset: 30, xScale: 0.85 }; break; // 下部の膨らみに寄せる
        case 'daikon': faceConfig = { yOffset: -20, xScale: 0.85 }; break; // 上部寄り
        case 'turnip': faceConfig = { yOffset: 40, xScale: 0.9 }; break; // カブの本体中心
        case 'mushroom': faceConfig = { yOffset: -50, xScale: 1.0 }; break; // カサの部分に配置
        case 'broccoli': faceConfig = { yOffset: -50, xScale: 1.0 }; break; // 房の部分に配置
        case 'onigiri': faceConfig = { yOffset: 20, xScale: 0.8 }; break; // 下部寄りで幅を確保
        case 'hamburger': faceConfig = { yOffset: -50, xScale: 0.9 }; break; // 上バンズに配置
        case 'strawberry': faceConfig = { yOffset: 10, xScale: 0.9 }; break;
        case 'sandwich': faceConfig = { yOffset: 40, xScale: 0.8 }; break; // 下部寄りで幅を確保
        case 'bean': faceConfig = { yOffset: -10, xScale: 0.7 }; break; // 豆の中央、細め
        default: faceConfig = { yOffset: 0, xScale: 1.0 }; break;
    }

    if (condition === 'fat') faceConfig.yOffset += 30; 
    if (condition === 'tired' || condition === 'hungry') faceConfig.yOffset += 10;

    const faceCenterY = centerY + faceConfig.yOffset;

    // チーク
    ctx.fillStyle = 'rgba(255, 140, 140, 0.4)';
    const cheekY = faceCenterY + 35;
    const cheekX = (condition === 'fat' ? 70 : 90) * faceConfig.xScale; 
    
    if (condition !== 'tired' && condition !== 'hungry') { 
        ctx.beginPath(); ctx.arc(centerX - cheekX, cheekY, 25, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(centerX + cheekX, cheekY, 25, 0, Math.PI * 2); ctx.fill();
    }

    // 目
    ctx.fillStyle = '#4B5563';
    ctx.strokeStyle = '#4B5563';
    
    let finalEyeType = randEyeType;
    if (condition === 'tired') finalEyeType = 3; 
    if (condition === 'hungry') finalEyeType = 5; 
    
    const eyeY = faceCenterY - 10;
    const eyeX = (condition === 'fat' ? 40 : 50) * faceConfig.xScale; 

    ctx.beginPath();
    ctx.lineWidth = 6;

    // 目の描画バリエーション (0-14)
    if (finalEyeType < 10) {
        if (finalEyeType === 0) { // 普通
            ctx.arc(centerX - eyeX, eyeY, 12, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(centerX + eyeX, eyeY, 12, 0, Math.PI * 2); ctx.fill();
        } else if (finalEyeType === 1) { // ニコ (アーチ)
            const s = 20;
            ctx.moveTo(centerX - eyeX - s, eyeY + 5); ctx.quadraticCurveTo(centerX - eyeX, eyeY - 15, centerX - eyeX + s, eyeY + 5);
            ctx.moveTo(centerX + eyeX - s, eyeY + 5); ctx.quadraticCurveTo(centerX + eyeX, eyeY - 15, centerX + eyeX + s, eyeY + 5);
            ctx.stroke();
        } else if (finalEyeType === 2) { // 縦長
            ctx.ellipse(centerX - eyeX, eyeY, 9, 15, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(centerX + eyeX, eyeY, 9, 15, 0, 0, Math.PI*2); ctx.fill();
        } else if (finalEyeType === 3) { // 線
            ctx.moveTo(centerX - eyeX - 15, eyeY); ctx.lineTo(centerX - eyeX + 15, eyeY);
            ctx.moveTo(centerX + eyeX - 15, eyeY); ctx.lineTo(centerX + eyeX + 15, eyeY);
            ctx.stroke();
        } else if (finalEyeType === 4) { // キラキラ (ハイライト大)
            ctx.arc(centerX - eyeX, eyeY, 14, 0, Math.PI * 2);
            ctx.arc(centerX + eyeX, eyeY, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFF';
            ctx.beginPath(); ctx.arc(centerX - eyeX - 4, eyeY - 4, 6, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(centerX + eyeX - 4, eyeY - 4, 6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#4B5563'; // Reset
        } else if (finalEyeType === 5) { // > <
            const s = 15;
            ctx.moveTo(centerX - eyeX - s, eyeY - s); ctx.lineTo(centerX - eyeX, eyeY); ctx.lineTo(centerX - eyeX - s, eyeY + s);
            ctx.moveTo(centerX + eyeX + s, eyeY - s); ctx.lineTo(centerX + eyeX, eyeY); ctx.lineTo(centerX + eyeX + s, eyeY + s);
            ctx.stroke();
        } else if (finalEyeType === 6) { // ジト目 (半円上)
            ctx.arc(centerX - eyeX, eyeY, 12, Math.PI, 0); ctx.fill();
            ctx.beginPath(); ctx.arc(centerX + eyeX, eyeY, 12, Math.PI, 0); ctx.fill();
        } else if (finalEyeType === 7) { // 逆アーチ (困り)
            const s = 15;
            ctx.moveTo(centerX - eyeX - s, eyeY); ctx.quadraticCurveTo(centerX - eyeX, eyeY + 15, centerX - eyeX + s, eyeY);
            ctx.moveTo(centerX + eyeX - s, eyeY); ctx.quadraticCurveTo(centerX + eyeX, eyeY + 15, centerX + eyeX + s, eyeY);
            ctx.stroke();
        } else if (finalEyeType === 8) { // ぐるぐる
            [ -eyeX, eyeX ].forEach(ox => {
                ctx.beginPath();
                for(let i=0; i<30; i++) {
                    const ang = i*0.5;
                    const rad = i*0.4;
                    ctx.lineTo(centerX + ox + Math.cos(ang)*rad, eyeY + Math.sin(ang)*rad);
                }
                ctx.stroke();
            });
        } else { // 点
            ctx.arc(centerX - eyeX, eyeY, 6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(centerX + eyeX, eyeY, 6, 0, Math.PI * 2); ctx.fill();
        }
    } else {
        // 白目ありタイプ (10-14)
        const drawEyeWithSclera = (x: number, y: number, size: number, pupilXOffset: number = 0, pupilYOffset: number = 0) => {
            // 白目
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            // 黒目
            ctx.fillStyle = '#4B5563';
            ctx.beginPath(); ctx.arc(x + pupilXOffset, y + pupilYOffset, size * 0.5, 0, Math.PI * 2); ctx.fill();
            // ハイライト
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath(); ctx.arc(x + pupilXOffset - size*0.15, y + pupilYOffset - size*0.15, size * 0.15, 0, Math.PI * 2); ctx.fill();
        };

        if (finalEyeType === 10) { // 普通の白目黒目
            drawEyeWithSclera(centerX - eyeX, eyeY, 20);
            drawEyeWithSclera(centerX + eyeX, eyeY, 20);
        } else if (finalEyeType === 11) { // 寄り目
            drawEyeWithSclera(centerX - eyeX, eyeY, 18, 4, 0);
            drawEyeWithSclera(centerX + eyeX, eyeY, 18, -4, 0);
        } else if (finalEyeType === 12) { // 横目
            drawEyeWithSclera(centerX - eyeX, eyeY, 18, 6, 0);
            drawEyeWithSclera(centerX + eyeX, eyeY, 18, 6, 0);
        } else if (finalEyeType === 13) { // 縦長白目
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath(); ctx.ellipse(centerX - eyeX, eyeY, 16, 22, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(centerX + eyeX, eyeY, 16, 22, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            
            ctx.fillStyle = '#4B5563';
            ctx.beginPath(); ctx.arc(centerX - eyeX, eyeY, 8, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(centerX + eyeX, eyeY, 8, 0, Math.PI*2); ctx.fill();
        } else { // 14: 半開き白目
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath(); ctx.arc(centerX - eyeX, eyeY, 18, 0, Math.PI, true); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(centerX + eyeX, eyeY, 18, 0, Math.PI, true); ctx.fill(); ctx.stroke();
            
            ctx.fillStyle = '#4B5563';
            ctx.beginPath(); ctx.arc(centerX - eyeX, eyeY - 5, 8, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(centerX + eyeX, eyeY - 5, 8, 0, Math.PI*2); ctx.fill();
        }
    }
    
    ctx.fillStyle = '#4B5563'; 

    // 眼鏡などの顔アクセサリー
    if (hasFaceAcc && condition !== 'tired') {
        const glassesY = eyeY;
        const lensSize = 25;
        
        ctx.strokeStyle = '#4B5563';
        ctx.lineWidth = 4;

        if (randFaceAccType === 0) { // 丸メガネ
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath(); ctx.arc(centerX - eyeX, glassesY, lensSize, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(centerX + eyeX, glassesY, lensSize, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(centerX - eyeX + lensSize, glassesY); ctx.lineTo(centerX + eyeX - lensSize, glassesY); ctx.stroke();
        } else if (randFaceAccType === 1) { // 四角メガネ
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            const w = 55, h = 40;
            ctx.beginPath(); ctx.roundRect(centerX - eyeX - w/2, glassesY - h/2, w, h, 5); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.roundRect(centerX + eyeX - w/2, glassesY - h/2, w, h, 5); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(centerX - eyeX + w/2, glassesY); ctx.lineTo(centerX + eyeX - w/2, glassesY); ctx.stroke();
        } else if (randFaceAccType === 2) { // サングラス
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.moveTo(centerX, glassesY - 10);
            ctx.bezierCurveTo(centerX - 20, glassesY - 10, centerX - eyeX, glassesY - 25, centerX - eyeX - 40, glassesY - 10);
            ctx.bezierCurveTo(centerX - eyeX - 40, glassesY + 30, centerX - eyeX, glassesY + 30, centerX - 5, glassesY + 10);
            ctx.moveTo(centerX, glassesY - 10);
            ctx.bezierCurveTo(centerX + 20, glassesY - 10, centerX + eyeX, glassesY - 25, centerX + eyeX + 40, glassesY - 10);
            ctx.bezierCurveTo(centerX + eyeX + 40, glassesY + 30, centerX + eyeX, glassesY + 30, centerX + 5, glassesY + 10);
            ctx.fill();
            ctx.beginPath(); ctx.moveTo(centerX - 5, glassesY - 10); ctx.lineTo(centerX + 5, glassesY - 10); ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath(); ctx.rect(centerX - eyeX - 20, glassesY - 15, 15, 8); ctx.fill();
            ctx.beginPath(); ctx.rect(centerX + eyeX + 10, glassesY - 15, 15, 8); ctx.fill();
        } else { // 黒丸太フレーム
            ctx.lineWidth = 6;
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.beginPath(); ctx.arc(centerX - eyeX, glassesY, lensSize + 2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(centerX + eyeX, glassesY, lensSize + 2, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(centerX - eyeX + lensSize, glassesY); ctx.lineTo(centerX + eyeX - lensSize, glassesY); ctx.stroke();
        }
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#4B5563';
    }

    // 口
    ctx.strokeStyle = '#4B5563';
    ctx.lineWidth = 6;
    let finalMouthType = randMouthType;
    if (condition === 'tired') finalMouthType = 4; 
    if (condition === 'hungry') finalMouthType = 5; 

    const mouthY = faceCenterY + 30;
    
    ctx.beginPath();
    // 口の描画バリエーション
    if (finalMouthType === 0) { // 小さい半円
        ctx.arc(centerX, mouthY, 10, 0, Math.PI);
    } else if (finalMouthType === 1) { // 開いた口 (D)
        ctx.fillStyle = '#FF9AA2'; 
        ctx.beginPath(); ctx.moveTo(centerX - 15, mouthY);
        ctx.quadraticCurveTo(centerX, mouthY + 25, centerX + 15, mouthY);
        ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (finalMouthType === 2) { // 波線 (ω)
        const w = 10;
        ctx.moveTo(centerX - w*2, mouthY); ctx.quadraticCurveTo(centerX - w, mouthY + 10, centerX, mouthY);
        ctx.quadraticCurveTo(centerX + w, mouthY + 10, centerX + w*2, mouthY);
    } else if (finalMouthType === 3) { // 縦長楕円 (O)
        ctx.ellipse(centerX, mouthY + 5, 8, 10, 0, 0, Math.PI*2);
    } else if (finalMouthType === 4) { // 真横線 (-)
        ctx.moveTo(centerX - 8, mouthY + 5); ctx.lineTo(centerX + 8, mouthY + 5);
    } else if (finalMouthType === 5) { // への字 (^)
        const w = 6;
        ctx.moveTo(centerX - w*1.5, mouthY + 5);
        ctx.quadraticCurveTo(centerX, mouthY - 5, centerX + w*1.5, mouthY + 5);
    } else if (finalMouthType === 6) { // 三角 (△)
        ctx.moveTo(centerX - 10, mouthY + 10); ctx.lineTo(centerX, mouthY); ctx.lineTo(centerX + 10, mouthY + 10); ctx.closePath(); ctx.stroke();
    } else if (finalMouthType === 7) { // 舌出し (P)
        ctx.moveTo(centerX - 10, mouthY); ctx.lineTo(centerX + 10, mouthY);
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath(); ctx.arc(centerX + 5, mouthY, 8, 0, Math.PI, false); ctx.fill(); ctx.stroke();
    } else if (finalMouthType === 8) { // 四角
        ctx.rect(centerX - 10, mouthY, 20, 10);
    } else { // ニッコリ (U)
        ctx.arc(centerX, mouthY, 15, 0, Math.PI);
    }
    ctx.stroke();

    // 疲れエフェクト (縦線)
    if (condition === 'tired' || condition === 'hungry') {
        ctx.save();
        ctx.strokeStyle = '#5A7F7F';
        ctx.lineWidth = 3;
        const gloomX = centerX + 80;
        const gloomY = eyeY - 20;
        ctx.beginPath();
        ctx.moveTo(gloomX, gloomY); ctx.lineTo(gloomX, gloomY + 40);
        ctx.moveTo(gloomX + 10, gloomY + 10); ctx.lineTo(gloomX + 10, gloomY + 50);
        ctx.moveTo(gloomX + 20, gloomY); ctx.lineTo(gloomX + 20, gloomY + 40);
        ctx.stroke();
        ctx.restore();
    }

    // 二重あご線 (Fat時)
    if (condition === 'fat') {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, mouthY + 30, 20, 0, Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    // 5. アクセサリー (頭)
    let showAcc = true;
    if (['strawberry', 'melon', 'watermelon', 'hamburger', 'broccoli', 'mushroom', 'carrot', 'turnip', 'daikon', 'eggplant'].includes(bodyType)) {
        if (randAccVis > 0.1) showAcc = false; 
    }

    if (showAcc) {
        const accColor = (condition === 'tired' || condition === 'hungry') ? desaturate(currentAccColor) : currentAccColor;
        let accY = centerY - 150; 
        
        if (bodyType === 'apple') accY -= 20;
        // マッシュルームの帽子位置調整 (カサの上)
        if (bodyType === 'mushroom') accY -= 50; 

        if (condition === 'fat') accY += 30;
        if (condition === 'tired' || condition === 'hungry') accY += 20;
        
        ctx.fillStyle = accColor;
        ctx.strokeStyle = '#6B7280';
        ctx.lineWidth = 5;

        if (randAccType === 1) {
            ctx.fillStyle = (condition === 'tired' || condition === 'hungry') ? desaturate('#A7D7C5') : '#A7D7C5';
            ctx.beginPath(); ctx.ellipse(centerX, accY, 20, 40, Math.PI / 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(centerX, accY + 10); ctx.lineTo(centerX + 15, accY - 20); ctx.stroke();
        } else if (randAccType === 2) {
            const ribY = accY + 10;
            ctx.beginPath(); ctx.ellipse(centerX - 40, ribY, 30, 25, -Math.PI/4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.ellipse(centerX + 40, ribY, 30, 25, Math.PI/4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(centerX, ribY, 15, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        } else if (randAccType === 3) {
            ctx.beginPath(); ctx.moveTo(centerX - 45, accY + 20); ctx.lineTo(centerX + 45, accY + 20); ctx.lineTo(centerX, accY - 80); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#FFF'; ctx.beginPath(); ctx.arc(centerX, accY - 80, 12, 0, Math.PI*2); ctx.fill(); ctx.stroke();
        } else if (randAccType === 4) {
            ctx.beginPath(); ctx.moveTo(centerX - 40, accY + 10); ctx.lineTo(centerX - 40, accY - 40); ctx.lineTo(centerX - 20, accY - 20); ctx.lineTo(centerX, accY - 50); ctx.lineTo(centerX + 20, accY - 20); ctx.lineTo(centerX + 40, accY - 40); ctx.lineTo(centerX + 40, accY + 10); ctx.closePath(); ctx.fill(); ctx.stroke();
        }
    }

    // 6. アイテム (右下)
    if (condition !== 'tired' && condition !== 'hungry') {
        if (randItemType > 0) {
            const itemX = centerX + (condition === 'fat' ? 140 : 120);
            const itemY = centerY + 120;
            ctx.lineWidth = 4;
            
            ctx.beginPath();
            if (randItemType === 1) {
                 ctx.fillStyle = '#FFB7B2';
                 const s = 1.8;
                 ctx.moveTo(itemX, itemY + 10);
                 ctx.bezierCurveTo(itemX - 10*s, itemY - 10*s, itemX - 20*s, itemY + 10*s, itemX, itemY + 25*s);
                 ctx.bezierCurveTo(itemX + 20*s, itemY + 10*s, itemX + 10*s, itemY - 10*s, itemX, itemY + 10);
            } else {
                 ctx.fillStyle = '#FFF5BA';
                 const r = 24;
                 for(let i=0; i<5; i++){
                     ctx.lineTo(Math.cos((18+i*72)/180*Math.PI)*r + itemX, -Math.sin((18+i*72)/180*Math.PI)*r + itemY);
                     ctx.lineTo(Math.cos((54+i*72)/180*Math.PI)*(r/2) + itemX, -Math.sin((54+i*72)/180*Math.PI)*(r/2) + itemY);
                 }
                 ctx.closePath();
            }
            ctx.fill();
            ctx.stroke();
        }
    }

    // Base64出力
    const dataUrl = canvas.toDataURL('image/png');
    return dataUrl.split(',')[1];
  } catch (error: any) {
    console.error("Local Mascot generation error:", error);
    throw new Error("画像生成に失敗しました。");
  }
};
