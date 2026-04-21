
import { MealAnalysis } from '../../types';
import { PFC_COLORS } from '../../utils';
import { OFFICIAL_MASCOT_SRC } from '../../constants/mascot';

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1350;

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        // エラー時はrejectして呼び出し元でキャッチできるように変更
        img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
        img.src = src;
    });
};

/**
 * イラスト風の背景を描画する関数
 * (水玉 + ステッチ枠のみ。絵文字・イラストなし)
 */
const drawIllustrationBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, mascotImg: HTMLImageElement | null) => {
    // 1. ベースカラー (アプリ共通のベージュ #FDFBF7)
    ctx.fillStyle = '#FDFBF7'; 
    ctx.fillRect(0, 0, width, height);

    // 大きな背景マスコット (Watermark)
    if (mascotImg) {
        ctx.save();
        ctx.globalAlpha = 0.08; // 6〜10%
        ctx.filter = 'grayscale(100%) brightness(150%)';
        const mSize = 600; 
        ctx.translate(100, 800); // 左側〜左下に配置
        ctx.rotate(-15 * Math.PI / 180);
        ctx.drawImage(mascotImg, -mSize/2, -mSize/2, mSize, mSize);
        ctx.restore();
    }

    // 2. パステル水玉パターン
    const dotColors = ['#FFE0B2', '#D1C4E9', '#B2DFDB', '#FFCDD2', '#F0F4C3']; 
    const spacing = 180;

    ctx.save();
    for (let y = 0; y < height + spacing; y += spacing) {
        const xOffset = (y / spacing) % 2 === 0 ? 0 : spacing / 2;
        for (let x = -spacing; x < width + spacing; x += spacing) {
            const cx = x + xOffset;
            const cy = y;
            const colorIndex = (Math.floor(cx) + Math.floor(cy)) % dotColors.length;
            
            ctx.beginPath();
            ctx.arc(cx, cy, 22, 0, Math.PI * 2);
            ctx.fillStyle = dotColors[colorIndex];
            ctx.globalAlpha = 0.15; // さらに薄く
            ctx.fill();
        }
    }
    ctx.restore();

    // 3. 全体を囲むステッチ（点線枠）と全体カード
    ctx.save();
    ctx.strokeStyle = '#E5DDD0'; // 少し明るく
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 15]); // 点線
    ctx.beginPath();
    ctx.roundRect(40, 40, 1000, 1270, 32);
    
    // 内側を同じベージュで塗りつぶし (#FDFBF7)
    ctx.fillStyle = '#FDFBF7';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
};

export const renderMealResultToCanvas = async (
    canvas: HTMLCanvasElement,
    photoBase64: string,
    meal: MealAnalysis,
    date: string
) => {
    // 1. フォント読み込み待機
    try { await document.fonts.ready; } catch(e) {}

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 2. 画像読み込み (メイン写真 & マスコット)
    const photoImgPromise = loadImage(
        photoBase64.startsWith('data:') || photoBase64.startsWith('file:') || photoBase64.startsWith('http') 
        ? photoBase64 
        : `data:image/jpeg;base64,${photoBase64}`
    );

    const mascotImgPromise = loadImage(OFFICIAL_MASCOT_SRC).catch((err) => {
        console.warn("Mascot image load failed in renderer:", err);
        return null;
    });

    const [photoImg, mascotImg] = await Promise.all([photoImgPromise, mascotImgPromise]);

    // 3. キャンバス初期化
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 4. イラスト風背景描画 (絵文字なし、背景ベージュ統一)
    drawIllustrationBackground(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, mascotImg);

    // 5. ヘッダー (ロゴ + 日付)
    // Mascot: 左寄せ、0.8倍に縮小 (216の0.8倍 -> 約172)
    // 破線に少しかぶるようにさらに左上へ移動
    if (mascotImg) {
        const boxX = 20;
        const boxY = 5;
        const boxW = 172;
        const boxH = 172;
        const imgAspect = mascotImg.width / mascotImg.height;
        const boxAspect = boxW / boxH;
        let drawW, drawH, drawX, drawY;
        
        // object-fit: contain 相当の計算
        if (imgAspect > boxAspect) {
            drawW = boxW;
            drawH = boxW / imgAspect;
            drawX = boxX;
            drawY = boxY + (boxH - drawH) / 2;
        } else {
            drawH = boxH;
            drawW = boxH * imgAspect;
            drawX = boxX + (boxW - drawW) / 2;
            drawY = boxY;
        }
        ctx.drawImage(mascotImg, drawX, drawY, drawW, drawH);
    } else {
        ctx.beginPath();
        // 172の半分 = 86
        ctx.arc(20 + 86, 5 + 86, 86, 0, Math.PI * 2);
        ctx.fillStyle = '#FFF0F0';
        ctx.fill();
    }

    // Title: 品名と同じサイズに
    ctx.fillStyle = '#7A7566';
    ctx.font = '900 50px "Zen Maru Gothic"';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('たべとっと。', 210, 85);

    // 日付 (バランス調整)
    ctx.fillStyle = '#A0937D';
    ctx.font = 'bold 31px "Zen Maru Gothic"'; // 日付をさらに微調整(28px -> 31px)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(date.replace(/-/g, '.'), 72 + 936, 85);

    // 6. 写真カードエリア (上へ移動)
    const photoX = 72;
    const photoY = 170;
    const photoW = 936;
    const photoH = 550; // 写真の縦幅をさらに少し伸ばす (525 -> 550)
    const photoRadius = 24;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, photoRadius);
    ctx.clip();

    // 写真を描画 (Cover fit)
    const imgAspect = photoImg.width / photoImg.height;
    const areaAspect = photoW / photoH;
    let rW, rH, rX, rY;
    if (imgAspect > areaAspect) {
        rH = photoH;
        rW = photoH * imgAspect;
        rX = photoX + (photoW - rW) / 2;
        rY = photoY;
    } else {
        rW = photoW;
        rH = photoW / imgAspect;
        rY = photoY + (photoH - rH) / 2;
        rX = photoX;
    }
    ctx.filter = 'saturate(1.2) contrast(1.05) brightness(1.02)';
    ctx.drawImage(photoImg, rX, rY, rW, rH);
    ctx.restore();

    // 7. kcalバッジ
    const badgeW = 320;
    const badgeH = 120;
    const badgeX = photoX + photoW - badgeW - 20; 
    const badgeY = photoY + photoH - badgeH / 2; 

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 5;
    
    // 背景
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 60); 
    ctx.fill();
    
    // 黄色枠
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#FFD93D';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    // テキスト
    const isFood = meal.category === 'food' || (meal.isFood !== false && meal.category !== 'non_food' && meal.category !== 'blocked');
    const isBlocked = meal.category === 'blocked' || meal.menuName === '解析できません';
    const kcalStr = (isFood && !isBlocked && meal.numericCalories !== undefined) ? String(Math.round(meal.numericCalories)) : '——';
    
    ctx.fillStyle = '#F88D8D';
    ctx.font = '900 84px "Zen Maru Gothic"';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    // 数値全体を左に寄せる (右端から多めに離す)
    ctx.fillText(kcalStr, badgeX + badgeW - 100, badgeY + 85);

    ctx.fillStyle = '#5D5745';
    ctx.font = '900 36px "Zen Maru Gothic"';
    ctx.textAlign = 'left';
    // 単位('kcal')も数値に合わせて左へ寄せる
    ctx.fillText('kcal', badgeX + badgeW - 90, badgeY + 85);
    ctx.restore();

    // 8. 品名欄
    const dishX = 72;
    const dishY = 730; // 写真に合わせて下げ (700 -> 730)
    const dishW = 620;

    const rawName = isBlocked ? "解析できません" : (meal.menuName || "メニュー名");
    
    ctx.fillStyle = '#5D5745';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 50px "Zen Maru Gothic"';
    
    // 折り返し
    let titleLines: string[] = [];
    let currentTLine = "";
    for (let i = 0; i < rawName.length; i++) {
        const char = rawName[i];
        const testLine = currentTLine + char;
        if (ctx.measureText(testLine).width > dishW) {
            titleLines.push(currentTLine);
            currentTLine = char;
        } else {
            currentTLine = testLine;
        }
    }
    if (currentTLine) titleLines.push(currentTLine);
    titleLines = titleLines.slice(0, 2);

    titleLines.forEach((line, i) => {
        ctx.fillText(line, dishX, dishY + (i * 60)); // 行間調整
    });

    // 9. コメント欄とメモ欄
    const commentX = 72;
    const commentY = 880; // 品名欄に合わせて下げ (850 -> 880)
    
    const totalPfc = meal.pfcRatio ? (meal.pfcRatio.p + meal.pfcRatio.f + meal.pfcRatio.c) : 0;
    const hasRightColumn = isFood && !isBlocked && (totalPfc > 0 || meal.microBalance);
    
    const commentW = hasRightColumn ? 540 : 936; // 左右幅を最適化

    if (meal.comment && !isBlocked) {
        ctx.font = 'bold 40px "Zen Maru Gothic"'; // 本文微増(38->40)
        let commentLines: string[] = [];
        let currentCLine = "";
        for (let i = 0; i < meal.comment.length; i++) {
            const char = meal.comment[i];
            const testLine = currentCLine + char;
            if (ctx.measureText(testLine).width > commentW - 48) { // paddingX*2
                commentLines.push(currentCLine);
                currentCLine = char;
            } else {
                currentCLine = testLine;
            }
        }
        if (currentCLine) commentLines.push(currentCLine);

        // 表示行数を大幅に増やし、途中で切れないようにする
        commentLines = commentLines.slice(0, 8); 

        const lineH = 54; // 行間微増(52->54)
        const paddingY = 35; 
        const paddingX = 24;
        let bgH = commentLines.length * lineH + paddingY * 2 - (lineH - 30);
        // メモがあれば背景高さを追加
        if (meal.memo) {
             const memoLinesCount = Math.ceil(ctx.measureText(meal.memo).width / (commentW - 48)) || 1;
             bgH += (memoLinesCount * lineH) + 50; 
        }
        
        // 右カラムの要素が必要とする最小高さ (グラフとゲージを含む)
        const minRightH = hasRightColumn ? 350 : 0;
        const commentH = Math.max(bgH, minRightH);

        // コメント欄の背景 (ごく薄いミント系)
        ctx.save();
        ctx.fillStyle = '#F4FAF8';
        ctx.beginPath();
        ctx.roundRect(commentX, commentY, commentW, commentH, 24);
        ctx.fill();
        
        ctx.strokeStyle = '#E0EEE9';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.stroke();
        ctx.restore();

        // コメントタグ「メモ」
        const tagW = 130;
        const tagH = 46;
        const tagX = commentX + 24;
        const tagY = commentY - 23; 
        
        ctx.save();
        ctx.fillStyle = '#E0EEE9'; 
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagW, tagH, 23);
        ctx.fill();
        
        ctx.fillStyle = '#7A8C87'; 
        ctx.font = '900 25px "Zen Maru Gothic"'; // ラベル微増(23->25)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('メモ', tagX + tagW / 2, tagY + tagH / 2 + 2);
        ctx.restore();

        ctx.fillStyle = '#7A7566';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        commentLines.forEach((line, i) => {
            ctx.fillText(line.trim(), commentX + paddingX, commentY + paddingY + (i * lineH));
        });
        
        // メモの描画
        if (meal.memo) {
             let memoY = commentY + paddingY + (commentLines.length * lineH) + 20;
             const mTagW = 96;
             const mTagX = commentX + 24;
             ctx.save();
             ctx.fillStyle = '#FFFFFF'; 
             ctx.beginPath();
             ctx.roundRect(mTagX, memoY - 23, mTagW, tagH, 23);
             ctx.fill();
             ctx.strokeStyle = '#E0EEE9';
             ctx.lineWidth = 2;
             ctx.stroke();
             ctx.fillStyle = '#7A8C87'; 
             ctx.font = '900 25px "Zen Maru Gothic"'; // ラベル微増
             ctx.textAlign = 'center';
             ctx.textBaseline = 'middle';
             ctx.fillText('メモ', mTagX + mTagW / 2, memoY - 23 + tagH / 2 + 2);
             ctx.restore();

             ctx.fillStyle = '#7A7566';
             ctx.textAlign = 'left';
             ctx.textBaseline = 'top';
             
             let memoLines: string[] = [];
             let currentMLine = "";
             ctx.font = 'bold 40px "Zen Maru Gothic"'; // 本文微増
             for (let i = 0; i < meal.memo.length; i++) {
                 const char = meal.memo[i];
                 const testLine = currentMLine + char;
                 if (ctx.measureText(testLine).width > commentW - 48) {
                     memoLines.push(currentMLine);
                     currentMLine = char;
                 } else {
                     currentMLine = testLine;
                 }
             }
             if (currentMLine) memoLines.push(currentMLine);
             
             // メモも極力表示
             memoLines = memoLines.slice(0, 4);
             memoLines.forEach((line, i) => {
                 ctx.fillText(line.trim(), commentX + paddingX, memoY + 25 + (i * lineH));
             });
        }
    }

    // 10. 右カラム (PFCドーナツグラフ & 栄養傾向チップ)
    if (hasRightColumn) {
        const rightX = commentX + commentW + 40;
        // メモ欄との連動を外し、kcalバッジの少し下（photoY + photoHあたり）を基準に調整
        // 十分な余白を取る(80->110に)干渉感をよりなくし、下重心へ
        const rightY = photoY + photoH + 110; 
        const rightW = 936 - commentW - 40; 

        // 背景塗りはなくし、透過にして空間に浮かせる
        
        const centerX = rightX + rightW / 2;
        let currentY = rightY;

        // PFC ドーナツグラフ
        if (totalPfc > 0) {
            ctx.fillStyle = '#A0937D';
            ctx.font = '900 30px "Zen Maru Gothic"'; // 見出し微増(28->30)
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('PFCバランス傾向', centerX, currentY);
            currentY += 45; // 間隔を広げる

            const radius = 70;
            const strokeWidth = 18;
            const chartCy = currentY + radius + strokeWidth;
            
            // 数値を横に置くため、円グラフの中心を少し左へ寄せる
            const donutCx = centerX - 55;

            // Background circle
            ctx.beginPath();
            ctx.arc(donutCx, chartCy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#EAE6DF'; // 少し落ち着いた色に
            ctx.lineWidth = strokeWidth;
            ctx.stroke();

            const pPct = meal.pfcRatio.p / totalPfc;
            const fPct = meal.pfcRatio.f / totalPfc;
            const cPct = meal.pfcRatio.c / totalPfc;

            let startAngle = -Math.PI / 2;
            const drawDonutSlice = (pct: number, color: string) => {
                if (pct <= 0) return;
                const angle = pct * Math.PI * 2;
                const gapAngle = Math.PI / 180 * 2; // 約2度の隙間
                if (angle > gapAngle) {
                    ctx.beginPath();
                    ctx.arc(donutCx, chartCy, radius, startAngle, startAngle + angle - gapAngle);
                    ctx.strokeStyle = color;
                    ctx.lineWidth = strokeWidth;
                    ctx.stroke();
                }
                startAngle += angle;
            };

            ctx.lineCap = 'butt';
            drawDonutSlice(pPct, PFC_COLORS.p);
            drawDonutSlice(fPct, PFC_COLORS.f);
            drawDonutSlice(cPct, PFC_COLORS.c);

            // Center text
            ctx.fillStyle = '#A0937D';
            ctx.font = '900 28px "Zen Maru Gothic"'; // (26->28)
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('PFC', donutCx, chartCy);

            // 右側のラベル (P, F, C を縦並び)
            const labelX = donutCx + radius + strokeWidth + 28;
            const valX = labelX + 26;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.font = '900 28px "Zen Maru Gothic"'; // (26->28)
            
            // P
            ctx.fillStyle = PFC_COLORS.p;
            ctx.fillText('P', labelX, chartCy - 40);
            ctx.fillStyle = '#5D5745';
            ctx.fillText(`${Math.round(pPct * 100)}%`, valX, chartCy - 40);
            
            // F
            ctx.fillStyle = PFC_COLORS.f;
            ctx.fillText('F', labelX, chartCy);
            ctx.fillStyle = '#5D5745';
            ctx.fillText(`${Math.round(fPct * 100)}%`, valX, chartCy);
            
            // C
            ctx.fillStyle = PFC_COLORS.c;
            ctx.fillText('C', labelX, chartCy + 40);
            ctx.fillStyle = '#5D5745';
            ctx.fillText(`${Math.round(cPct * 100)}%`, valX, chartCy + 40);

            // グラフの下の余白も少し広げる
            currentY = chartCy + radius + strokeWidth + 50;
        }

        // 栄養素ゲージ
        if (meal.microBalance) {
            ctx.fillStyle = '#A0937D';
            ctx.font = '900 30px "Zen Maru Gothic"'; // 見出し微増(28->30)
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText('栄養の傾向', centerX, currentY);
            currentY += 45; // 間隔を広げる

            const items = [
                { label: 'ビタミン', val: meal.microBalance.vitamin, color: '#F59E0B' },
                { label: 'ミネラル', val: meal.microBalance.mineral, color: '#14B8A6' },
                { label: '食物繊維', val: meal.microBalance.fiber, color: '#84CC16' }
            ];

            const getEvalText = (val: number) => val === 2 ? 'しっかり' : val === 1 ? 'ほどほど' : 'ひかえめ';
            const boxes = [1, 2, 3];

            const gaugeW = 360; // 文字拡大に対応(350->360)
            const gaugeX = centerX - gaugeW / 2;
            const labelW = 100; // (92->100)
            const evalW = 95; // (95)
            const middleW = gaugeW - labelW - evalW - 10; // 中間のゲージ幅
            const boxW = (middleW - (boxes.length - 1) * 6) / boxes.length; // 隙間を6確保

            items.forEach((item, idx) => {
                const itemY = currentY + (idx * 50); // 間隔(50)
                
                // Labels (Left)
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#7A7566';
                ctx.font = '900 26px "Zen Maru Gothic"'; // ラベル微増(24->26)
                ctx.fillText(item.label, gaugeX, itemY);
                
                // Eval Text (Right)
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = item.val > 0 ? item.color : '#A8A29E';
                ctx.font = '900 22px "Zen Maru Gothic"'; // 評価語は原則維持(22)
                ctx.fillText(getEvalText(item.val), gaugeX + gaugeW, itemY);

                // Boxes (Middle)
                const gaugeStartX = gaugeX + labelW + 5;
                boxes.forEach((b, bIdx) => {
                    const bx = gaugeStartX + (bIdx * (boxW + 6));
                    ctx.save();
                    
                    let isLightOn = false;
                    let alpha = 1.0;

                    if (item.val === 0) {
                        if (b === 1) { isLightOn = true; alpha = 0.25; }
                    } else if (item.val === 1) {
                        if (b <= 2) { 
                            isLightOn = true; 
                            alpha = b === 1 ? 0.35 : 0.7; 
                        }
                    } else if (item.val === 2) {
                        isLightOn = true;
                        alpha = b === 1 ? 0.35 : (b === 2 ? 0.7 : 1.0);
                    }
                    
                    if (isLightOn) {
                        ctx.fillStyle = item.color;
                        ctx.globalAlpha = alpha;
                    } else {
                        // 極薄の土台色: #EAE6DF
                        ctx.fillStyle = '#EAE6DF';
                        ctx.globalAlpha = 1.0;
                    }

                    ctx.beginPath();
                    const boxH = 12; // ちょっと縦幅スリムに
                    ctx.roundRect(bx, itemY - boxH / 2, boxW, boxH, 4);
                    ctx.fill();
                    ctx.restore();
                });
            });
        }
    }
};

export const renderMealResultToBlob = async (
    photoBase64: string,
    meal: MealAnalysis,
    date: string
): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    await renderMealResultToCanvas(canvas, photoBase64, meal, date);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
};
