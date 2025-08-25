document.addEventListener('DOMContentLoaded', function() {
    // Ably配置
    const ably = new Ably.Realtime('nc5NGw.wSmsXg:SMs5pD5aJ4hGMvNZnd7pJp2lYS2X1iCmWm_yeLx_pkk');
    const channel = ably.channels.get('comic-share');
    
    // GoFile配置
    const goFileAccountId = '9e174948-3c6c-47e6-a706-8aedbf7b8598';
    const goFileToken = '8UO7T53rxM6Eh3WzolDR4SeaLedZ17bE';
    
    // DOM元素
    const bookshelfGrid = document.querySelector('.bookshelf-grid');
    const nextToUploadBtn = document.getElementById('next-to-upload');
    const backToShelvesBtn = document.getElementById('back-to-shelves');
    const uploadForm = document.getElementById('upload-form');
    const shareAnotherBtn = document.getElementById('share-another');
    const selectedShelfName = document.getElementById('selected-shelf-name');
    const newPasswordEl = document.getElementById('new-password');
    
    // 当前选中的书柜
    let selectedShelf = null;
    
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
                selectBookshelf(i);
            });
            
            bookshelfGrid.appendChild(bookshelfItem);
        }
    }
    
    // 选择书柜
    function selectBookshelf(shelfId) {
        // 移除之前的选中状态
        document.querySelectorAll('.bookshelf-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // 添加选中状态
        const selectedItem = document.querySelector(`.bookshelf-item[data-shelf-id="${shelfId}"]`);
        selectedItem.classList.add('selected');
        
        selectedShelf = shelfId;
        nextToUploadBtn.disabled = false;
    }
    
    // 下一步到上传页面
    nextToUploadBtn.addEventListener('click', function() {
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');
    });
    
    // 返回书柜选择
    backToShelvesBtn.addEventListener('click', function() {
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step1').classList.add('active');
    });
    
    // 上传漫画
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('comic-title').value;
        const description = document.getElementById('comic-desc').value;
        const fileInput = document.getElementById('comic-file');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('请选择漫画文件');
            return;
        }
        
        // 检查文件大小
        if (file.size > 500 * 1024 * 1024) { // 500MB
            alert('文件大小不能超过500MB');
            return;
        }
        
        // 显示加载状态
        const submitBtn = uploadForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = '上传中...';
        
        try {
            // 上传文件到GoFile
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`https://api.gofile.io/uploadFile?accountId=${goFileAccountId}&token=${goFileToken}`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.status !== 'ok') {
                throw new Error('文件上传失败');
            }
            
            const fileUrl = result.data.downloadPage;
            
            // 生成随机密码
            const newPassword = generateRandomPassword();
            
            // 创建漫画数据
            const comicData = {
                id: Date.now(),
                title,
                description,
                fileUrl,
                fileType: file.name.split('.').pop().toLowerCase(),
                uploadTime: new Date().toISOString(),
                shelfId: selectedShelf
            };
            
            // 发布到Ably
            channel.publish(`shelf-${selectedShelf}`, {
                type: 'comic-upload',
                data: comicData,
                password: newPassword
            });
            
            // 显示成功页面
            document.getElementById('step2').classList.remove('active');
            document.getElementById('step3').classList.add('active');
            
            selectedShelfName.textContent = `书柜 ${selectedShelf}`;
            newPasswordEl.textContent = newPassword;
            
        } catch (error) {
            console.error('上传失败:', error);
            alert('上传失败，请重试');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '上传漫画';
        }
    });
    
    // 再分享一本
    shareAnotherBtn.addEventListener('click', function() {
        // 重置表单
        uploadForm.reset();
        
        // 重置步骤
        document.getElementById('step3').classList.remove('active');
        document.getElementById('step1').classList.add('active');
        
        // 重置书柜选择
        document.querySelectorAll('.bookshelf-item').forEach(item => {
            item.classList.remove('selected');
        });
        selectedShelf = null;
        nextToUploadBtn.disabled = true;
    });
    
    // 生成随机密码
    function generateRandomPassword() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    // 初始化
    initBookshelves();
});
