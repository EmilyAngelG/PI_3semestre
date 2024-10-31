document.addEventListener('DOMContentLoaded', function () {
    // Lógica para o botão de logout
    const logoutBtn = document.querySelector('#logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    if (response.redirected) {
                        window.location.href = response.url; // Redireciona após logout
                    }
                })
                .catch(error => console.error('Erro ao fazer logout:', error));
        };
    }
});