document.addEventListener('DOMContentLoaded', () => {
    // 既存のコード...

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
