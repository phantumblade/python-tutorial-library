// Funzione di utilità per eseguire codice a DOM pronto
function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

ready(function() {
    document.body.classList.add('loaded');
    console.log('Pagina caricata');
});
