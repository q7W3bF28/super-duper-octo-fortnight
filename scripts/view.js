document.addEventListener('DOMContentLoaded', function() {
    // Ably配置
    const ably = new Ably.Realtime('nc5NGw.wSmsXg:SMs5pD5aJ4hGMvNZnd7pJp2lYS2X1iCmWm_yeLx_pkk');
    const channel = ably.channels.get('comic-share');
    
    // DOM元素
    const bookshelfGrid = document.querySelector('.bookshelf-grid');
    const passwordModal = document.getElementById('password-modal');
    const modalShelfName = document.getElementById('modal-shelf-name');
    const passwordForm = document.getElementById('password-form');
    const cancelPasswordBtn = document.getElementById('cancel-password');
    const passwordError = document.getElementById('password-error');
    
    // 当前选中的书柜
    let selectedShelf = null;
    let currentPassword = '123456'; // 初始密码
    
    // 初始化书柜
    function initBookshelves() {
        for (let i = 1; i <= 10; i++) {
            const bookshelfItem = document.createElement('div');
            bookshelfItem.className = 'bookshelf-item';
            bookshelfItem.dataset.shelfId = i;
            
            bookshelfItem.innerHTML = `
                <div class="icon">📚</div>
                <h3>书柜 ${i}</h3>
                <p>点击选择</p>
            `;
            
            bookshelfItem.addEventListener('click', function() {
                openPasswordModal(i);
            });
            
            bookshelfGrid.appendChild(bookshelfItem);
        }
    }
    
    // 打开密码模态框
    function openPasswordModal(shelfId) {
        selectedShelf = shelfId;
        modalShelfName.textContent = `书柜 ${shelfId}`;
        passwordModal.style.display = 'flex';
        document.getElementById('shelf-password').value = '';
        passwordError.style.display = 'none';
        
        // 订阅书柜频道获取最新密码
        const shelfChannel = ably.channels.get(`comic-share:shelf-${shelfId}`);
        shelfChannel.subscribe('comic-upload', (message) => {
            currentPassword = message.data.password;
        });
    }
    
    // 关闭密码模态框
    function closePasswordModal() {
        passwordModal.style.display = 'none';
    }
    
    // 取消密码输入
    cancelPasswordBtn.addEventListener('click', closePasswordModal);
    
    // 提交密码
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const enteredPassword = document.getElementById('shelf-password').value;
        
        if (enteredPassword === currentPassword) {
            // 密码正确，跳转到阅读页面
            window.location.href = `viewer.html?shelf=${selectedShelf}&password=${enteredPassword}`;
        } else {
            // 密码错误
            passwordError.style.display = 'block';
            document.getElementById('shelf-password').value = '';
        }
    });
    
    // 初始化
    initBookshelves();
});
