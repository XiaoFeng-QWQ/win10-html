'use strict'

import { WindowManager } from '../../StaticResources/Js/Manager/WindowManager.js';
import { ImageErrorHandler } from '../../StaticResources/Js/Utils/ImageErrorHandler.js';

$(document).ready(function () {
    ImageErrorHandler.init();
});

// 文件系统模拟数据 - 为每个项目添加id属性
const fileSystem = {
    'this-pc': {
        id: 'this-pc',
        name: '此电脑',
        type: 'folder',
        icon: 'shell32_16.ico',
        children: ['c-drive', 'd-drive', 'dvd-drive']
    },
    'quick-access': {
        id: 'quick-access',
        name: '快速访问',
        type: 'folder',
        icon: 'quick-access.png',
        children: ['desktop', 'downloads', 'documents']
    },
    'desktop': {
        id: 'desktop',
        name: '桌面',
        type: 'folder',
        icon: 'desktop.ico',
        path: 'desktop',
        children: ['this-pc']
    },
    'downloads': {
        id: 'downloads',
        name: '下载',
        type: 'folder',
        icon: 'downloads.png',
        children: ['file1.zip', 'installer.exe', 'project.pdf']
    },
    'documents': {
        id: 'documents',
        name: '文档',
        type: 'folder',
        icon: 'documents.png',
        children: ['resume.docx', 'notes.txt', 'budget.xlsx', 'project.pdf']
    },
    'pictures': {
        id: 'pictures',
        name: '图片',
        type: 'folder',
        icon: 'pictures.png',
        children: ['vacation.jpg', 'family.png', 'screenshot.png', 'wallpaper.jpg']
    },
    'music': {
        id: 'music',
        name: '音乐',
        type: 'folder',
        icon: 'music.ico',
        children: ['song1.mp3', 'song2.mp3', 'playlist.m3u', 'album.flac']
    },
    'videos': {
        id: 'videos',
        name: '视频',
        type: 'folder',
        icon: 'videos.png',
        children: ['movie.mp4', 'clip.avi', 'recording.mkv', 'tutorial.mp4']
    },
    'network': {
        id: 'network',
        name: '网络',
        type: 'folder',
        icon: '25.ico',
        children: []
    },
    'c-drive': {
        id: 'c-drive',
        name: '本地磁盘 (C:)',
        type: 'drive',
        icon: 'drive_c.ico',
        path: 'C:',
        size: '120 GB',
        free: '20 GB',
        children: ['Program Files', 'Windows', 'Users', 'ProgramData']
    },
    'd-drive': {
        id: 'd-drive',
        name: '本地磁盘 (D:)',
        type: 'drive',
        icon: 'drive.ico',
        path: 'D:',
        size: '465 GB',
        free: '312 GB',
        children: ['Data', 'Backup', 'Games', 'Software']
    },
    'dvd-drive': {
        id: 'dvd-drive',
        name: 'DVD驱动器 (E:)',
        type: 'drive',
        icon: 'dvd.ico',
        path: 'E:',
        children: []
    },
    // 文件项
    'file1.zip': {
        id: 'file1.zip',
        name: 'archive.zip',
        type: 'zip',
        icon: 'zip.png',
        size: '15.2 MB',
        modified: '2026-02-20 14:30'
    },
    'file2.pdf': {
        id: 'file2.pdf',
        name: 'document.pdf',
        type: 'pdf',
        icon: 'pdf.png',
        size: '2.1 MB',
        modified: '2026-02-18 09:45'
    },
    'installer.exe': {
        id: 'installer.exe',
        name: 'setup.exe',
        type: 'exe',
        icon: 'exe.png',
        size: '45.8 MB',
        modified: '2026-02-15 11:20'
    },
    'resume.docx': {
        id: 'resume.docx',
        name: '简历.docx',
        type: 'docx',
        icon: 'docx.png',
        size: '1.2 MB',
        modified: '2026-02-22 16:30'
    },
    'notes.txt': {
        id: 'notes.txt',
        name: '笔记.txt',
        type: 'txt',
        icon: 'notepad_2.ico',
        size: '12 KB',
        modified: '2026-02-21 10:15'
    },
    'project.pdf': {
        id: 'project.pdf',
        name: '项目计划.pdf',
        type: 'pdf',
        icon: 'pdf.png',
        size: '3.5 MB',
        modified: '2026-02-19 13:40'
    },
    'budget.xlsx': {
        id: 'budget.xlsx',
        name: '预算.xlsx',
        type: 'xlsx',
        icon: 'xlsx.png',
        size: '856 KB',
        modified: '2026-02-17 09:30'
    },
    'vacation.jpg': {
        id: 'vacation.jpg',
        name: '度假.jpg',
        type: 'jpg',
        icon: 'jpg.png',
        size: '2.8 MB',
        modified: '2026-02-10 14:20'
    },
    'family.png': {
        id: 'family.png',
        name: '家庭.png',
        type: 'png',
        icon: 'png.png',
        size: '4.2 MB',
        modified: '2026-02-05 18:45'
    },
    'screenshot.png': {
        id: 'screenshot.png',
        name: '截图.png',
        type: 'png',
        icon: 'png.png',
        size: '1.5 MB',
        modified: '2026-02-23 09:10'
    },
    'wallpaper.jpg': {
        id: 'wallpaper.jpg',
        name: '壁纸.jpg',
        type: 'jpg',
        icon: 'jpg.png',
        size: '3.1 MB',
        modified: '2026-02-01 20:30'
    },
    'song1.mp3': {
        id: 'song1.mp3',
        name: '歌曲1.mp3',
        type: 'mp3',
        icon: 'mp3.png',
        size: '5.3 MB',
        modified: '2026-01-15 11:20'
    },
    'song2.mp3': {
        id: 'song2.mp3',
        name: '歌曲2.mp3',
        type: 'mp3',
        icon: 'mp3.png',
        size: '4.8 MB',
        modified: '2026-01-20 14:35'
    },
    'playlist.m3u': {
        id: 'playlist.m3u',
        name: '播放列表.m3u',
        type: 'm3u',
        icon: 'playlist.png',
        size: '2 KB',
        modified: '2026-02-22 19:15'
    },
    'album.flac': {
        id: 'album.flac',
        name: '专辑.flac',
        type: 'flac',
        icon: 'flac.png',
        size: '32.5 MB',
        modified: '2026-01-25 08:45'
    },
    'movie.mp4': {
        id: 'movie.mp4',
        name: '电影.mp4',
        type: 'mp4',
        icon: 'mp4.png',
        size: '1.2 GB',
        modified: '2026-02-14 21:30'
    },
    'clip.avi': {
        id: 'clip.avi',
        name: '片段.avi',
        type: 'avi',
        icon: 'avi.png',
        size: '350 MB',
        modified: '2026-02-16 13:20'
    },
    'recording.mkv': {
        id: 'recording.mkv',
        name: '录制.mkv',
        type: 'mkv',
        icon: 'mkv.png',
        size: '850 MB',
        modified: '2026-02-19 10:45'
    },
    'tutorial.mp4': {
        id: 'tutorial.mp4',
        name: '教程.mp4',
        type: 'mp4',
        icon: 'mp4.png',
        size: '520 MB',
        modified: '2026-02-20 15:10'
    },
    // 文件夹项
    'Program Files': {
        id: 'Program Files',
        name: 'Program Files',
        type: 'folder',
        icon: 'folder.ico',
        modified: '2026-01-10 09:00',
        children: []
    },
    'Windows': {
        id: 'Windows',
        name: 'Windows',
        type: 'folder',
        icon: 'folder.ico',
        modified: '2026-01-05 08:30',
        children: []
    },
    'Users': {
        id: 'Users',
        name: 'Users',
        type: 'folder',
        icon: 'folder.ico',
        modified: '2026-01-08 14:15',
        children: []
    },
    'ProgramData': {
        id: 'ProgramData',
        name: 'ProgramData',
        type: 'folder',
        icon: 'folder.ico',
        modified: '2026-01-12 11:45',
        children: []
    },
    'Data': {
        id: 'Data',
        name: 'Data',
        type: 'folder',
        icon: 'folder.ico',
        modified: '2026-02-01 10:00',
        children: []
    },
    'Backup': {
        id: 'Backup',
        name: 'Backup',
        type: 'folder',
        icon: 'folder.ico',
        modified: '2026-02-02 16:30',
        children: []
    },
    'Games': {
        id: 'Games',
        name: 'Games',
        type: 'folder',
        icon: 'folder.ico',
        modified: '2026-01-25 19:45',
        children: []
    },
    'Software': {
        id: 'Software',
        name: 'Software',
        type: 'folder',
        icon: 'folder.ico',
        modified: '2026-01-28 13:20',
        children: []
    }
};

// 当前状态
let currentPath = 'this-pc';
let history = ['this-pc'];
let historyIndex = 0;
let selectedItems = [];
let clipboard = null;
let viewMode = 'icons'; // icons, list, details
let searchTerm = '';

// 获取当前窗口
const $currentWindow = $(window.frameElement).closest('.win-window');

// 初始化
function init() {
    loadPath(currentPath);
    setupEventListeners();
    updateNavigationButtons();
    updateStatusBar();
}

// 加载路径
function loadPath(path) {
    const folder = fileSystem[path];
    if (!folder || (folder.type !== 'folder' && folder.type !== 'drive')) return;

    currentPath = path;
    $('#address-input').val(folder.name);

    // 获取子项目
    let items = [];
    if (folder.children) {
        items = folder.children.map(id => fileSystem[id]).filter(Boolean);
    }

    // 搜索过滤
    if (searchTerm) {
        items = items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    renderItems(items);
    updateStatusBar(items.length);

    // 更新导航栏选中状态
    $('.nav-item').removeClass('active');
    $(`.nav-item[data-path="${path}"]`).addClass('active');
}

// 渲染项目
function renderItems(items) {
    // 图标视图
    const $grid = $('#file-grid');
    $grid.empty();

    // 列表视图
    const $tbody = $('#file-table-body');
    $tbody.empty();

    items.forEach(item => {
        // 图标视图 - 使用item.id作为data-id
        const iconHtml = `
            <div class="file-item" data-id="${item.id}" data-type="${item.type}">
                <img src="../../StaticResources/Icons/${item.icon || getDefaultIcon(item)}" alt="${item.name}">
                <span class="file-name">${item.name}</span>
                ${item.size ? `<span class="file-size">${item.size}</span>` : ''}
                ${item.modified ? `<span class="file-date">${item.modified}</span>` : ''}
            </div>
        `;
        $grid.append(iconHtml);

        // 列表视图 - 使用item.id作为data-id
        const rowHtml = `
            <tr data-id="${item.id}" data-type="${item.type}">
                <td>
                    <img class="file-icon" src="../../StaticResources/Icons/${item.icon || getDefaultIcon(item)}" alt="">
                    ${item.name}
                </td>
                <td>${item.modified || '-'}</td>
                <td>${getFileType(item)}</td>
                <td>${item.size || '-'}</td>
            </tr>
        `;
        $tbody.append(rowHtml);
    });

    // 移除旧的事件监听，添加新的事件监听
    $('.file-item, .file-list-view tbody tr').off('click dblclick contextmenu');
    $('.file-item, .file-list-view tbody tr').on('click', handleItemClick);
    $('.file-item, .file-list-view tbody tr').on('dblclick', handleItemDoubleClick);
    $('.file-item, .file-list-view tbody tr').on('contextmenu', handleItemContextMenu);
}

// 获取默认图标
function getDefaultIcon(item) {
    if (item.type === 'folder') return 'folder.ico';
    if (item.type === 'drive') return 'drive.ico';
    if (item.type === 'zip') return 'zip.png';
    if (item.type === 'exe') return 'exe.png';
    if (['jpg', 'png', 'gif', 'bmp'].includes(item.type)) return 'image.png';
    if (['mp3', 'flac', 'wav'].includes(item.type)) return 'audio.png';
    if (['mp4', 'avi', 'mkv', 'mov'].includes(item.type)) return 'video.png';
    if (['doc', 'docx'].includes(item.type)) return 'docx.png';
    if (['xls', 'xlsx'].includes(item.type)) return 'xlsx.png';
    if (item.type === 'pdf') return 'pdf.png';
    if (item.type === 'txt') return 'txt.png';
    return 'file.png';
}

// 获取文件类型
function getFileType(item) {
    if (item.type === 'folder') return '文件夹';
    if (item.type === 'drive') return '本地磁盘';
    if (item.type === 'zip') return '压缩文件';
    if (item.type === 'exe') return '应用程序';
    if (item.type === 'pdf') return 'PDF 文档';
    if (item.type === 'txt') return '文本文档';
    if (['doc', 'docx'].includes(item.type)) return 'Word 文档';
    if (['xls', 'xlsx'].includes(item.type)) return 'Excel 文档';
    if (['jpg', 'png', 'gif'].includes(item.type)) return '图片文件';
    if (['mp3', 'flac', 'wav'].includes(item.type)) return '音频文件';
    if (['mp4', 'avi', 'mkv'].includes(item.type)) return '视频文件';
    return '文件';
}

// 设置事件监听
function setupEventListeners() {
    // 导航按钮
    $('#nav-back, #back-button').on('click', goBack);
    $('#nav-forward, #forward-button').on('click', goForward);
    $('#nav-up, #up-button').on('click', goUp);
    $('#refresh-button').on('click', () => loadPath(currentPath));

    // 地址栏
    $('#address-input').on('keypress', function (e) {
        if (e.key === 'Enter') {
            const path = $(this).val();
            // 简单处理，实际应该解析路径
            const found = Object.keys(fileSystem).find(key =>
                fileSystem[key].name === path
            );
            if (found) {
                navigateTo(found);
            }
        }
    });

    // 搜索
    $('#search-input').on('input', function () {
        searchTerm = $(this).val();
        loadPath(currentPath);
    });

    // 视图切换
    $('#view-icons').on('click', () => switchView('icons'));
    $('#view-list').on('click', () => switchView('list'));
    $('#view-details').on('click', () => switchView('details'));

    // 工具栏按钮
    $('#new-folder-button').on('click', createNewFolder);
    $('#cut-button').on('click', cutItems);
    $('#copy-button').on('click', copyItems);
    $('#paste-button').on('click', pasteItems);
    $('#delete-button').on('click', deleteItems);
    $('#rename-button').on('click', renameItem);
    $('#properties-button').on('click', showProperties);

    // 导航栏点击
    $('.nav-item').on('click', function () {
        $('.nav-item').removeClass('active');
        $(this).addClass('active');
        const path = $(this).data('path');
        if (path) {
            navigateTo(path);
        }
    });

    // 点击空白处取消选择
    $('#file-list-icons, #file-list-list').on('click', function (e) {
        if (e.target === this || $(e.target).is('.file-grid, .file-list-view')) {
            clearSelection();
        }
    });
}

// 导航
function navigateTo(path) {
    if (!fileSystem[path]) return;

    // 更新历史
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }
    history.push(path);
    historyIndex = history.length - 1;

    loadPath(path);
    updateNavigationButtons();
    clearSelection();
}

function goBack() {
    if (historyIndex > 0) {
        historyIndex--;
        loadPath(history[historyIndex]);
        updateNavigationButtons();
    }
}

function goForward() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        loadPath(history[historyIndex]);
        updateNavigationButtons();
    }
}

function goUp() {
    // 简化处理，实际应该获取父路径
    if (currentPath === 'this-pc') return;

    // 查找父路径（简化：如果是在C盘下，返回此电脑）
    if (currentPath === 'c-drive' || currentPath === 'd-drive' ||
        currentPath === 'dvd-drive' || currentPath === 'documents' ||
        currentPath === 'downloads' || currentPath === 'music' ||
        currentPath === 'pictures' || currentPath === 'videos') {
        navigateTo('this-pc');
    } else {
        // 其他情况返回此电脑
        navigateTo('this-pc');
    }
}

function updateNavigationButtons() {
    $('#nav-back, #back-button').toggleClass('disabled', historyIndex <= 0);
    $('#nav-forward, #forward-button').toggleClass('disabled', historyIndex >= history.length - 1);
    $('#nav-up, #up-button').toggleClass('disabled', currentPath === 'this-pc');
}

// 视图切换
function switchView(mode) {
    viewMode = mode;
    $('#view-icons, #view-list, #view-details').removeClass('active');
    $(`#view-${mode}`).addClass('active');

    $('#file-list-icons, #file-list-list').addClass('hidden');
    if (mode === 'icons') {
        $('#file-list-icons').removeClass('hidden');
    } else {
        $('#file-list-list').removeClass('hidden');
    }
}

// 项目点击处理
function handleItemClick(e) {
    e.stopPropagation();
    const $item = $(this);
    const id = $item.data('id');

    if (e.ctrlKey) {
        // 多选
        $item.toggleClass('selected');
        updateSelectedItems();
    } else if (e.shiftKey) {
        // 范围选择（简化）
        // 实际应该实现范围选择
    } else {
        // 单选
        $('.file-item, .file-list-view tbody tr').removeClass('selected');
        $item.addClass('selected');
        updateSelectedItems();
    }
}

function handleItemDoubleClick(e) {
    const $item = $(this);
    const key = $item.data('id');
    console.log('双击的键名:', key);

    const item = fileSystem[key];

    if (item) {
        if (item.type === 'folder' || item.type === 'drive') {
            // 如果是文件夹或驱动器，直接导航
            console.log('导航到:', key);
            navigateTo(key);
        } else {
            // 打开文件
            openFile(item);
        }
    } else {
        console.log('未找到项目，键名:', key);
    }
}

function handleItemContextMenu(e) {
    e.preventDefault();
    const $item = $(this);
    const id = $item.data('id');

    if (!$item.hasClass('selected')) {
        clearSelection();
        $item.addClass('selected');
        updateSelectedItems();
    }

    // 显示右键菜单
    showContextMenu(e.pageX, e.pageY, id);
}

// 更新选中项目
function updateSelectedItems() {
    selectedItems = [];
    $('.file-item.selected, .file-list-view tbody tr.selected').each(function () {
        const id = $(this).data('id');
        selectedItems.push(id);
    });
    updateStatusBar();
}

function clearSelection() {
    $('.file-item, .file-list-view tbody tr').removeClass('selected');
    selectedItems = [];
    updateStatusBar();
}

// 更新状态栏
function updateStatusBar(count) {
    const folder = fileSystem[currentPath];
    const itemCount = count || (folder.children ? folder.children.length : 0);
    $('#item-count').text(`${itemCount} 个项目`);

    if (selectedItems.length > 0) {
        $('#selected-count').text(`已选择 ${selectedItems.length} 个项目`);
    } else {
        $('#selected-count').text('');
    }

    if (currentPath === 'c-drive' || currentPath === 'd-drive') {
        const drive = fileSystem[currentPath];
        $('#drive-info').text(`${drive.free} 可用，共 ${drive.size}`);
    } else {
        $('#drive-info').text('');
    }
}

// 打开文件
function openFile(item) {
    const $currentWindow = $(window.frameElement).closest('.win-window');

    if (item.type === 'txt') {
        // 打开记事本
        window.parent.WindowManager.openApp({
            name: 'Notepad',
            url: '/App/system/notepad.html?file_content=SGVsbG8gV29ybGQh&file_name=我的文档.txt',
            icon: '/StaticResources/Icons/notepad_2.ico'
        });
    } else if (item.type === 'jpg' || item.type === 'png') {
        // 打开图片查看器（简化）
        window.parent.MessageBoxManager.info(
            `打开图片: ${item.name}`,
            '图片查看器',
            null,
            $currentWindow
        );
    } else if (item.type === 'mp3' || item.type === 'mp4') {
        // 打开媒体播放器（简化）
        window.parent.MessageBoxManager.info(
            `播放: ${item.name}`,
            '媒体播放器',
            null,
            $currentWindow
        );
    } else {
        window.parent.MessageBoxManager.info(
            `打开文件: ${item.name}`,
            '此电脑',
            null,
            $currentWindow
        );
    }
}

// 创建新文件夹
function createNewFolder() {
    const $currentWindow = $(window.frameElement).closest('.win-window');

    const dialogHTML = `
        <div class="new-folder-dialog">
            <div class="dialog-row">
                <label for="folder-name">文件夹名称:</label>
                <input type="text" id="folder-name" class="folder-input" value="新建文件夹" autofocus>
            </div>
        </div>
    `;

    window.parent.MessageBoxManager.showCustom({
        title: '新建文件夹',
        parentWindow: $currentWindow,
        width: '350px',
        height: '150px',
        customContent: dialogHTML,
        onShow: function () {
            setTimeout(() => {
                $('#folder-name').focus().select();
                $('#folder-name').on('keypress', function (e) {
                    if (e.key === 'Enter') {
                        $('.win-message-box-button.primary').click();
                    }
                });
            }, 200);
        },
        callback: function (result, data) {
            if (result === 'ok') {
                const folderName = $('#folder-name').val() || '新建文件夹';
                // 实际应该添加到文件系统
            }
        }
    });
}

// 剪切
function cutItems() {
    if (selectedItems.length === 0) return;
    clipboard = {
        action: 'cut',
        items: [...selectedItems]
    };
}

// 复制
function copyItems() {
    if (selectedItems.length === 0) return;
    clipboard = {
        action: 'copy',
        items: [...selectedItems]
    };
}

// 粘贴
function pasteItems() {
    if (!clipboard || clipboard.items.length === 0) return;

    const $currentWindow = $(window.frameElement).closest('.win-window');
    const action = clipboard.action === 'cut' ? '移动' : '复制';

    window.parent.MessageBoxManager.info(
        `${action} ${clipboard.items.length} 个项目`,
        '此电脑',
        null,
        $currentWindow
    );

    clipboard = null;
}

// 删除项目
function deleteItems() {
    if (selectedItems.length === 0) return;

    const $currentWindow = $(window.frameElement).closest('.win-window');
    const count = selectedItems.length;

    window.parent.MessageBoxManager.confirm(
        `确定要将这 ${count} 个项目移动到回收站吗？`,
        '删除文件',
        function (result) {
            if (result === 'yes') {
                clearSelection();
            }
        },
        $currentWindow
    );
}

// 重命名
function renameItem() {
    if (selectedItems.length !== 1) return;

    const itemId = selectedItems[0];
    const item = fileSystem[itemId];
    if (!item) return;

    const $currentWindow = $(window.frameElement).closest('.win-window');

    const dialogHTML = `
        <div class="rename-dialog">
            <div class="dialog-row">
                <label for="new-name">新名称:</label>
                <input type="text" id="new-name" class="rename-input" value="${item.name}" autofocus>
            </div>
        </div>
    `;

    window.parent.MessageBoxManager.showCustom({
        title: '重命名',
        parentWindow: $currentWindow,
        width: '350px',
        height: '150px',
        customContent: dialogHTML,
        onShow: function () {
            setTimeout(() => {
                $('#new-name').focus().select();
                $('#new-name').on('keypress', function (e) {
                    if (e.key === 'Enter') {
                        $('.win-message-box-button.primary').click();
                    }
                });
            }, 200);
        },
        callback: function (result, data) {
            if (result === 'ok') {
                const newName = $('#new-name').val() || item.name;
                window.parent.MessageBoxManager.success(
                    `已重命名为 "${newName}"`,
                    '重命名',
                    null,
                    $currentWindow
                );
                // 实际应该更新文件系统
            }
        }
    });
}

// 显示属性
function showProperties() {
    if (selectedItems.length === 0) return;

    const $currentWindow = $(window.frameElement).closest('.win-window');

    if (selectedItems.length === 1) {
        const itemId = selectedItems[0];
        const item = fileSystem[itemId];

        let details = '';
        if (item.type === 'folder' || item.type === 'drive') {
            details = `类型: ${item.type === 'drive' ? '本地磁盘' : '文件夹'}\n`;
            if (item.size) details += `容量: ${item.size}\n`;
            if (item.free) details += `可用空间: ${item.free}\n`;
        } else {
            details = `类型: ${getFileType(item)}\n`;
            details += `大小: ${item.size || '0 KB'}\n`;
            details += `修改日期: ${item.modified || '-'}\n`;
        }

        window.parent.MessageBoxManager.info(
            `${item.name}\n\n${details}`,
            '属性',
            null,
            $currentWindow
        );
    } else {
        window.parent.MessageBoxManager.info(
            `已选择 ${selectedItems.length} 个项目`,
            '属性',
            null,
            $currentWindow
        );
    }
}

// 显示右键菜单
function showContextMenu(x, y, itemId) {
    const item = fileSystem[itemId];
    const isFolder = item && (item.type === 'folder' || item.type === 'drive');

    const menuItems = [
        { text: '打开', action: () => handleItemDoubleClick.call($(`[data-id="${itemId}"]`)[0]) },
        { text: '在新窗口中打开', action: () => window.parent.MessageBoxManager.info('在新窗口中打开', '此电脑') },
        { separator: true },
        { text: '剪切', action: cutItems },
        { text: '复制', action: copyItems },
        { text: '粘贴', action: pasteItems },
        { text: '删除', action: deleteItems },
        { text: '重命名', action: renameItem },
        { separator: true },
        { text: '属性', action: showProperties }
    ];

    if (isFolder) {
        menuItems.splice(1, 0,
            { text: '固定到快速访问', action: () => window.parent.MessageBoxManager.info('已固定到快速访问', '此电脑') },
            { separator: true }
        );
    }

    // 调用父窗口的右键菜单
    if (window.parent && window.parent.ContextMenuManager) {
        window.parent.ContextMenuManager.createMenu(x, y, menuItems, 'file-context-menu');
    }
}

// 添加CSS样式
const styleHTML = `
    <style>
        .new-folder-dialog,
        .rename-dialog {
            padding: 20px;
        }
        
        .dialog-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .dialog-row label {
            width: 80px;
            text-align: right;
            font-size: 14px;
        }
        
        .folder-input,
        .rename-input {
            flex: 1;
            padding: 5px 8px;
            border: 1px solid #ccc;
            border-radius: 3px;
            font-size: 14px;
        }
        
        .folder-input:focus,
        .rename-input:focus {
            outline: none;
            border-color: #0078d4;
            box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.3);
        }
        
        .file-date {
            font-size: 11px;
            color: #666;
            margin-top: 2px;
        }
    </style>
`;

// 添加样式到页面
$('head').append(styleHTML);

// 启动应用
$(document).ready(function () {
    init();
});