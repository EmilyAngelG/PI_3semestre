document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-form');
    const loginForm = document.querySelector('.login-form-container');
    const signupForm = document.querySelector('.signup-form-container');

    // Lógica para o botão de pesquisa
    const searchBtn = document.querySelector('#search-btn');
    if (searchBtn) {
        searchBtn.onclick = () => {
            searchForm.classList.toggle('active');
        };
    }


    // Lógica para o botão de login
    const loginBtn = document.querySelector('#login-btn');

    if (loginBtn) {
        loginBtn.onclick = () => {
            if (!usuarioLogado) { // Verifica se o usuário não está logado
                loginForm.classList.toggle('active'); // Exibe o formulário de login
            } else {
                window.location.href = '/paginaUsuario'; // Redireciona para a página do usuário
            }
        };
    }

    // Lógica para fechar o formulário de login
    const closeLoginBtn = document.querySelector('#close-login-btn');
    if (closeLoginBtn) {
        closeLoginBtn.onclick = () => {
            loginForm.classList.remove('active');
        };
    }




    // Lógica para rolagem da página
    window.onscroll = () => {
        if (searchForm) {
            searchForm.classList.remove('active');
        }

        const header2 = document.querySelector('.header .header-2');
        if (header2) {
            if (window.scrollY > 80) {
                header2.classList.add('active');
            } else {
                header2.classList.remove('active');
            }
        }
    };

    // Lógica para o formulário de cadastro
    const signupBtn = document.querySelector('#signup-btn');
    if (signupBtn) {
        signupBtn.onclick = () => {
            signupForm.classList.toggle('active');
        };
    }

    const closeSignupBtn = document.querySelector('#close-signup-btn');
    if (closeSignupBtn) {
        closeSignupBtn.onclick = () => {
            signupForm.classList.remove('active');
        };
    }

    // Adicionando a lógica para o login
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async function (event) {
            event.preventDefault(); // Impede o envio padrão do formulário

            const formData = new FormData(this);
            const data = {
                email: formData.get('email'),
                senha: formData.get('senha')
            };

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorText = await response.text(); // Captura o erro retornado do servidor
                    alert(`Erro: ${errorText}`); // Exibe o erro
                } else {
                    // Se o login for bem-sucedido, redireciona para a página do usuário
                    window.location.href = 'paginaUsuario';
                }
            } catch (error) {
                console.error('Erro ao enviar o formulário:', error);
                alert('Erro no servidor, tente novamente mais tarde.');
            }
        });
    }

    // Manter a sessão ativa com requisições periódicas
    setInterval(() => {
        fetch('/keep-alive'); // Envie uma requisição para manter a sessão ativa
    }, 20000); // 20 segundos




    //Página do Usuário
    document.getElementById('edit-button').addEventListener('click', function () {
        // Ativa todos os campos de formulário para edição
        document.querySelectorAll('#user-data-form input').forEach(input => {
            input.removeAttribute('readonly');
        });

        // Exibe os botões "Atualizar" e "Cancelar"
        document.getElementById('save-button').classList.remove('d-none');
        document.getElementById('cancel-button').classList.remove('d-none');
        document.getElementById('edit-button').classList.add('d-none');
        document.getElementById('delete-button').classList.add('d-none');

    });

    document.getElementById('cancel-button').addEventListener('click', function () {
        // Desativa os campos de formulário, voltando ao modo de exibição
        document.querySelectorAll('#user-data-form input').forEach(input => {
            input.setAttribute('readonly', true);
            
            window.location.reload(); // Recarrega a página
        });

        // Alterna a visibilidade dos botões
        document.getElementById('save-button').classList.add('d-none');
        document.getElementById('cancel-button').classList.add('d-none');
        document.getElementById('edit-button').classList.remove('d-none');
        document.getElementById('delete-button').classList.remove('d-none');
    });

    // Referências aos elementos do popup
    const deleteButton = document.getElementById('delete-button');
    const confirmDeletePopup = document.getElementById('confirmDeletePopup');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');

    // Abrir o popup ao clicar no botão "Excluir"
    deleteButton.addEventListener('click', () => {
        confirmDeletePopup.style.display = 'block';
    });

    // Fechar o popup ao clicar em "Cancelar"
    cancelDelete.addEventListener('click', () => {
        confirmDeletePopup.style.display = 'none';
    });

    // Lógica de exclusão ao clicar em "Excluir"
    confirmDelete.addEventListener('click', () => {
        const usuarioId = deleteButton.getAttribute('data-usuario-id');
        console.log("UsuarioId recebido: ")
        console.log(usuarioId)
        // Faz uma requisição POST para a rota de exclusão
        fetch('/excluirUsuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuarioId }) // Passa o ID do usuário
        })
            .then(response => {
                if (response.ok) {
                    window.location.href = '/'; // Redireciona para a página principal após a exclusão
                } else {
                    alert('Erro ao excluir a conta. Tente novamente.');
                }
            });
    });

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
