document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const shareChoice = document.getElementById('share-choice');
    const viewChoice = document.getElementById('view-choice');
    
    // 添加点击事件
    shareChoice.addEventListener('click', function() {
        window.location.href = 'share.html';
    });
    
    viewChoice.addEventListener('click', function() {
        window.location.href = 'view.html';
    });
});
