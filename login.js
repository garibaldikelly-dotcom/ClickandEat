// Configuración de la API
const API_URL = 'http://localhost:3000/api';

// Verificar si ya hay sesión activa
document.addEventListener('DOMContentLoaded', () => {
    checkExistingSession();
    initializeLoginForm();
});

// Verificar sesión existente
async function checkExistingSession() {
    const token = localStorage.getItem('authToken');
    
    if (token) {
        try {
            const response = await fetch(`${API_URL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Redirigir a la página principal
                window.location.href = '/';
                return;
            }
        } catch (error) {
            console.error('Error al verificar sesión:', error);
        }
        
        // Si el token no es válido, eliminarlo
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
    }
}

// Inicializar formulario
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        const icon = togglePassword.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    });
    
    // Handle form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Auto-fill demo credentials if checkbox is checked
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe === 'true') {
        document.getElementById('rememberMe').checked = true;
        const savedUsername = localStorage.getItem('savedUsername');
        if (savedUsername) {
            document.getElementById('username').value = savedUsername;
        }
    }
}

// Manejar login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const btnLogin = document.getElementById('btnLogin');
    
    // Validar campos
    if (!username || !password) {
        showAlert('Por favor completa todos los campos');
        return;
    }
    
    // Deshabilitar botón y mostrar loading
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Iniciando sesión...</span>';
    hideAlert();
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar token y datos del usuario
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Guardar preferencia de recordar
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
                localStorage.setItem('savedUsername', username);
            } else {
                localStorage.removeItem('rememberMe');
                localStorage.removeItem('savedUsername');
            }
            
            // Mostrar mensaje de éxito
            showSuccessMessage();
            
            // Redirigir después de 1 segundo
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showAlert(data.error || 'Error al iniciar sesión');
            btnLogin.disabled = false;
            btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Iniciar Sesión</span>';
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        showAlert('Error al conectar con el servidor. Por favor intenta nuevamente.');
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> <span>Iniciar Sesión</span>';
    }
}

// Mostrar alerta de error
function showAlert(message) {
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    
    alertMessage.textContent = message;
    alertBox.classList.add('show');
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        hideAlert();
    }, 5000);
}

// Ocultar alerta
function hideAlert() {
    const alertBox = document.getElementById('alertBox');
    alertBox.classList.remove('show');
}

// Mostrar mensaje de éxito
function showSuccessMessage() {
    const alertBox = document.getElementById('alertBox');
    const alertMessage = document.getElementById('alertMessage');
    
    alertBox.className = 'alert show';
    alertBox.style.background = '#dcfce7';
    alertBox.style.color = '#166534';
    alertBox.style.borderColor = '#86efac';
    
    alertMessage.innerHTML = '<i class="fas fa-check-circle"></i> ¡Inicio de sesión exitoso! Redirigiendo...';
}

// Manejar "Enter" en los campos
document.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        loginForm.dispatchEvent(new Event('submit'));
    }
});
