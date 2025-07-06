document.addEventListener('DOMContentLoaded', () => {
    const rouletteSvg = document.getElementById('roulette-svg');
    const rouletteSpinner = document.getElementById('roulette-spinner');
    const spinButton = document.getElementById('spin-button');
    const resultDisplay = document.getElementById('result');
    const optionsTextarea = document.getElementById('options-textarea');
    const updateOptionsButton = document.getElementById('update-options-button');

    // 初期ルーレット項目
    let options = [
        "A", "B", "C", "D"
    ];

    const colors = [
        "#FFDDC1", "#FFABAB", "#FFDAA8", "#FFEAB7", "#D4F0F0",
        "#C5E1A5", "#FFF2CC", "#DCE775", "#B3E5FC", "#FFCDD2"
    ];

    const centerX = 150;
    const centerY = 150;
    const radius = 140;

    // 度をラジアンに変換
    function toRad(angle) {
        return angle * Math.PI / 180;
    }

    // ルーレットの項目をSVGで描画する関数
    function drawRoulette() {
        rouletteSvg.innerHTML = ''; // 既存の要素をクリア
        const totalOptions = options.length;
        if (totalOptions === 0) return;

        const anglePerOption = 360 / totalOptions;

        options.forEach((option, index) => {
            const startAngle = index * anglePerOption;
            const endAngle = (index + 1) * anglePerOption;

            const startX = centerX + radius * Math.cos(toRad(startAngle));
            const startY = centerY + radius * Math.sin(toRad(startAngle));
            const endX = centerX + radius * Math.cos(toRad(endAngle));
            const endY = centerY + radius * Math.sin(toRad(endAngle));

            const largeArcFlag = anglePerOption > 180 ? 1 : 0;

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("d", `M${centerX},${centerY} L${startX},${startY} A${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`);
            path.setAttribute("fill", colors[index % colors.length]);
            path.classList.add('segment');
            rouletteSvg.appendChild(path);

            // テキストの配置
            const textAngle = startAngle + anglePerOption / 2; // 項目の中心角度
            const textRadius = radius * 0.7; // 中心からテキストまでの距離
            const textX = centerX + textRadius * Math.cos(toRad(textAngle));
            const textY = centerY + textRadius * Math.sin(toRad(textAngle));

            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", textX);
            text.setAttribute("y", textY);
            // テキストの回転（読めるように）
            text.setAttribute("transform", `rotate(${textAngle + 90}, ${textX}, ${textY})`);
            text.textContent = option;
            rouletteSvg.appendChild(text);
        });
    }

    // スピンボタンのクリックイベント
    spinButton.addEventListener('click', () => {
        if (options.length === 0) {
            resultDisplay.textContent = "項目がありません。設定してください。";
            return;
        }
        if (options.length === 1) {
            resultDisplay.textContent = `結果: ${options[0]}`;
            return;
        }

        spinButton.disabled = true;
        resultDisplay.textContent = "スピン中...";
        rouletteSpinner.style.transition = 'none'; // 一旦トランジションをリセット
        rouletteSpinner.style.transform = 'rotate(0deg)'; // 開始位置をリセット

        const totalOptions = options.length;
        const anglePerOption = 360 / totalOptions;
        const randomIndex = Math.floor(Math.random() * totalOptions);
        
        // 目標の項目（randomIndex）の中心がポインターの真下（物理的な上方向）に来るように計算
        // SVGの描画基準は右方向が0度で時計回り。
        // CSSでルーレット全体を-90度回転させているため、SVGの0度が物理的な下方向に来ている。
        // ポインターは物理的な上方向（つまりSVGの90度の位置に相当する）にある。

        // 目的の項目のSVG上での中心角度: (randomIndex * anglePerOption) + (anglePerOption / 2)

        // ポインターが指す物理的な上方向（ルーレット上の90度の位置）に、
        // 目的の項目の中央が来るように回転させたい。
        
        let spinDegrees = 90 - (randomIndex * anglePerOption + anglePerOption / 2);
        spinDegrees = (spinDegrees % 360 + 360) % 360; // 0-359度の範囲に正規化

        const rotations = 5; // 最低5回転
        const finalAngle = (rotations * 360) + spinDegrees; // 複数回転分を足す

        // アニメーションの適用
        setTimeout(() => {
            rouletteSpinner.style.transition = 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)';
            rouletteSpinner.style.transform = `rotate(${finalAngle}deg)`;
        }, 10);

        // アニメーション終了後に結果を表示
        rouletteSpinner.addEventListener('transitionend', () => {
            // 現在のルーレットの回転角度を0〜359度の範囲に正規化
            const actualRotation = (finalAngle % 360 + 360) % 360;

            // ポインターは上（物理的な0度）に固定されている。
            // ルーレットは時計回りに回転する。
            // SVGはCSSで-90度回転されている。

            // 物理的な上方向 (ポインター位置) が、停止したルーレット上のどの角度（SVG基準）になるかを計算。
            // `actualRotation` はルーレットが時計回りに回った角度。
            // `90` はSVGの初期回転によるオフセット。
            // `360 - (...)` は反時計回りへの変換。

            let pointerPointingAngleOnRoulette = (360 - (actualRotation + 90)) % 360;
            pointerPointingAngleOnRoulette = (pointerPointingAngleOnRoulette + 360) % 360; // 負の値の補正

            // **** ここが修正点です ****
            // 「左側に表示される」ということは、計算された角度が本来よりも小さい、
            // またはインデックスが小さく算出されていることを意味します。
            // 角度を増やすことで、結果が右にシフトすることを期待します。
            // ご提案の「90度ずらす」をここに適用してみます。
            // `pointerPointingAngleOnRoulette` をさらに90度ずらすことで、
            // 物理的な上方向とルーレットの角度のずれを修正します。
            pointerPointingAngleOnRoulette = (pointerPointingAngleOnRoulette + 90) % 360;
            // 必要に応じてさらに負の値を補正
            pointerPointingAngleOnRoulette = (pointerPointingAngleOnRoulette + 360) % 360;

            // わずかな計算誤差を吸収するために、角度にごくわずかなオフセット（epsilon）を加える
            const epsilon = 0.0001; 
            pointerPointingAngleOnRoulette = (pointerPointingAngleOnRoulette + epsilon) % 360;

            let calculatedIndex = Math.floor(pointerPointingAngleOnRoulette / anglePerOption);
            
            // 最終的なインデックスの調整（範囲外になった場合）
            calculatedIndex = Math.max(0, Math.min(calculatedIndex, totalOptions - 1));
            
            const selectedOption = options[calculatedIndex];
            resultDisplay.textContent = `結果: ${selectedOption}`;
            spinButton.disabled = false;
        }, { once: true });
    });

    // 項目更新ボタンのクリックイベント
    updateOptionsButton.addEventListener('click', () => {
        const newOptionsString = optionsTextarea.value.trim();
        if (newOptionsString) {
            options = newOptionsString.split('\n').map(item => item.trim()).filter(item => item !== '');
            if (options.length === 0) {
                alert("項目が入力されていません。");
                return;
            }
            drawRoulette();
            resultDisplay.textContent = "";
        } else {
            alert("項目を入力してください。");
            options = [];
            drawRoulette();
            resultDisplay.textContent = "項目がありません。";
        }
    });

    // 初期表示用の項目をテキストエリアに設定
    optionsTextarea.value = options.join('\n');

    // 初期ルーレット描画
    drawRoulette();

    // PWA用のService Workerを登録
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }

    // 既存のルーレット関連コード...
});
