'use strict'

import { ImageErrorHandler } from '../../StaticResources/Js/Utils/ImageErrorHandler.js';

// 获取DOM元素 - 使用jQuery
const $editor = $('#editor');
const $fileInput = $('#file-input');
const $saveLink = $('#save-link');
const $statusBar = $('#status-bar');
const $lineColInfo = $('#line-col-info');

// 菜单相关元素
const $menuItems = $('.menu-item');
const $dropdowns = $('.menu-dropdown');

// 当前文件信息
let currentFile = null;
let isModified = false;
let fontSize = 16;
let isWordWrap = false;
let isStatusBarVisible = true;

// 初始化编辑器
function initEditor() {
    // 设置默认字体
    $editor.css({
        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
        fontSize: fontSize + 'px'
    });

    // 监听内容变化
    $editor.on('input', function () {
        isModified = true;
        updateLineColInfo();
        updateTitle();
    });

    // 监听光标位置变化
    $editor.on('click keyup', updateLineColInfo);

    // 初始化菜单事件
    initMenu();

    // 初始化快捷键
    initShortcuts();

    // 更新状态栏
    updateLineColInfo();

    // 初始化窗口关闭处理
    initWindowCloseHandler();

    // 处理URL参数
    handleUrlParameters();
}

// 处理URL参数
function handleUrlParameters() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    const fileContentBase64 = urlParams.get('file_content');

    if (fileContentBase64) {
        try {
            // 解码base64内容
            const decodedContent = atob(fileContentBase64);
            $editor.val(decodedContent);

            // 设置文件名为从URL参数或默认值
            const fileName = urlParams.get('file_name') || '文档.txt';
            currentFile = { name: fileName };

            // 重置修改状态
            isModified = false;

            // 更新标题
            updateTitle();

            // 更新行和列信息
            updateLineColInfo();

            console.log('成功加载URL参数中的文件内容');
        } catch (e) {
            console.error('解码base64内容失败:', e);

            // 显示错误信息
            const $currentWindow = $(window.frameElement).closest('.win-window');
            if (window.parent.MessageBoxManager) {
                window.parent.MessageBoxManager.error(
                    '无法解码传入的文件内容，请检查base64编码是否正确。',
                    '错误',
                    null,
                    $currentWindow
                );
            }

            // 可以显示一个默认的错误提示内容
            $editor.val('// 错误：无法解码传入的文件内容\n// 请检查URL参数是否正确');
        }
    }
}

// 初始化菜单
function initMenu() {
    // 显示/隐藏下拉菜单
    $menuItems.on('click', function (e) {
        const dropdownId = this.id.replace('-menu', '-dropdown');
        const $dropdown = $('#' + dropdownId);

        // 隐藏所有下拉菜单
        $dropdowns.not($dropdown).hide();
        $menuItems.not(this).removeClass('active');

        // 切换当前下拉菜单
        if ($dropdown.is(':visible')) {
            $dropdown.hide();
            $(this).removeClass('active');
        } else {
            $dropdown.show();
            $(this).addClass('active');

            // 定位下拉菜单
            const rect = this.getBoundingClientRect();
            $dropdown.css({
                left: rect.left + 'px',
                top: rect.bottom + 'px'
            });
        }

        e.stopPropagation();
    });

    // 点击其他地方隐藏菜单
    $(document).on('click', function () {
        $dropdowns.hide();
        $menuItems.removeClass('active');
    });

    // 文件菜单功能
    $('#new-file').on('click', newFile);
    $('#open-file').on('click', openFile);
    $('#save-file').on('click', saveFile);
    $('#save-as-file').on('click', saveAsFile);
    $('#print-file').on('click', printFile);
    $('#exit').on('click', exitApp);

    // 编辑菜单功能
    $('#undo').on('click', undo);
    $('#cut').on('click', cut);
    $('#copy').on('click', copy);
    $('#paste').on('click', paste);
    $('#delete').on('click', deleteText);
    $('#select-all').on('click', selectAll);
    $('#time-date').on('click', insertTimeDate);
    $('#find').on('click', findText);
    $('#replace').on('click', replaceText);

    // 格式菜单功能
    $('#word-wrap').on('click', toggleWordWrap);
    $('#font').on('click', changeFont);

    // 查看菜单功能
    $('#zoom-in').on('click', zoomIn);
    $('#zoom-out').on('click', zoomOut);
    $('#restore-zoom').on('click', restoreZoom);
    $('#toggle-status-bar').on('click', toggleStatusBar);

    // 帮助菜单功能
    $('#view-help').on('click', viewHelp);
    $('#about-notepad').on('click', showAbout);
}

// 初始化快捷键
function initShortcuts() {
    $(document).on('keydown', function (e) {
        // Alt+F4 关闭窗口
        if (e.altKey && e.key === 'F4') {
            e.preventDefault();
            exitApp();
            return;
        }

        // 检查是否按下了Ctrl键
        const ctrlKey = e.ctrlKey || e.metaKey;

        // 文件操作
        if (ctrlKey) {
            switch (e.key.toLowerCase()) {
                case 'n': e.preventDefault(); newFile(); break;
                case 'o': e.preventDefault(); openFile(); break;
                case 's': e.preventDefault(); saveFile(); break;
                case 'p': e.preventDefault(); printFile(); break;
                case 'z': e.preventDefault(); undo(); break;
                case 'x': e.preventDefault(); cut(); break;
                case 'c': e.preventDefault(); copy(); break;
                case 'v': e.preventDefault(); paste(); break;
                case 'a': e.preventDefault(); selectAll(); break;
                case 'f': e.preventDefault(); findText(); break;
                case 'h': e.preventDefault(); replaceText(); break;
                case '0': e.preventDefault(); restoreZoom(); break;
                case '=':
                case '+':
                    if (e.shiftKey) {
                        e.preventDefault();
                        zoomIn();
                    }
                    break;
                case '-': e.preventDefault(); zoomOut(); break;
            }
        }

        // 其他快捷键
        switch (e.key) {
            case 'F3': e.preventDefault(); findNext(); break;
            case 'F5': e.preventDefault(); insertTimeDate(); break;
            case 'Delete': e.preventDefault(); deleteText(); break;
        }
    });
}

// 文件操作函数
function newFile() {
    if (isModified) {
        showSaveConfirmationDialog(true);
    } else {
        resetEditor();
    }
}

function showSaveConfirmationDialog(shouldCloseAfter = false) {
    const $currentWindow = $(window.frameElement).closest('.win-window');

    window.parent.MessageBoxManager.confirmCancel(
        '是否将更改保存到？',
        '记事本',
        function (result) {
            if (result === 'ok') {
                saveFile();
                if (shouldCloseAfter) {
                    setTimeout(() => {
                        closeWindow($currentWindow);
                    }, 100);
                } else {
                    resetEditor();
                }
            } else if (result === 'no') {
                if (shouldCloseAfter) {
                    closeWindow($currentWindow);
                } else {
                    resetEditor();
                }
            }
            // cancel 则什么都不做
        },
        $currentWindow
    );
}

function resetEditor() {
    $editor.val('');
    currentFile = null;
    isModified = false;
    updateTitle();
}

function openFile() {
    $fileInput.click();
}

$fileInput.on('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        $editor.val(e.target.result);
        currentFile = file;
        isModified = false;
        updateTitle();
    };
    reader.readAsText(file);
});

function saveFile() {
    if (currentFile) {
        saveToFile(currentFile.name, $editor.val());
        isModified = false;
        updateTitle();
    } else {
        saveAsFile();
    }
}

function saveAsFile() {
    const $currentWindow = $(window.frameElement).closest('.win-window');

    const fileNameDialogHTML = `
        <div class="filename-dialog">
            <div class="filename-dialog-row">
                <label for="filename-input">文件名(N):</label>
                <input type="text" id="filename-input" class="filename-input" value="无标题.txt" autofocus>
            </div>
        </div>
    `;

    window.parent.MessageBoxManager.showCustom({
        title: '另存为',
        parentWindow: $currentWindow,
        width: '400px',
        height: '150px',
        customContent: fileNameDialogHTML,
        onShow: function () {
            setTimeout(() => {
                $('#filename-input').focus().select();

                $('#filename-input').on('keypress', function (e) {
                    if (e.key === 'Enter') {
                        $('.win-message-box-button.primary').click();
                    }
                });
            }, 200);
        },
        callback: function (result, data) {
            if (result === 'ok') {
                const fileName = $('#filename-input').val() || '无标题.txt';

                const blob = new Blob([$editor.val()], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);

                $saveLink.attr({
                    href: url,
                    download: fileName
                })[0].click();

                currentFile = { name: fileName };
                isModified = false;
                updateTitle();
            }
        }
    });
}

function saveToFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    $saveLink.attr({
        href: url,
        download: filename
    })[0].click();

    isModified = false;
    updateTitle();
}

function printFile() {
    window.print();
}

function exitApp() {
    const $currentWindow = $(window.frameElement).closest('.win-window');

    if (isModified) {
        showSaveConfirmationDialog(true);
    } else {
        closeWindow($currentWindow);
    }
}

function closeWindow($window) {
    if (!$window || !$window.length) {
        $window = $(window.frameElement).closest('.win-window');
    }
    $window.find('.win-window-close').click();
}

// 编辑操作函数
function undo() {
    document.execCommand('undo', false, null);
}

function cut() {
    document.execCommand('cut', false, null);
}

function copy() {
    document.execCommand('copy', false, null);
}

function paste() {
    document.execCommand('paste', false, null);
}

function deleteText() {
    const start = $editor[0].selectionStart;
    const end = $editor[0].selectionEnd;
    const value = $editor.val();

    if (start === end) {
        $editor.val(value.substring(0, start) + value.substring(end + 1));
    } else {
        $editor.val(value.substring(0, start) + value.substring(end));
    }

    $editor[0].selectionStart = start;
    $editor[0].selectionEnd = start;
    isModified = true;
    updateTitle();
}

function selectAll() {
    $editor.select();
}

function insertTimeDate() {
    const now = new Date();
    const timeDateStr = now.toLocaleString();

    const start = $editor[0].selectionStart;
    const value = $editor.val();

    $editor.val(value.substring(0, start) + timeDateStr + value.substring(start));

    $editor[0].selectionStart = start + timeDateStr.length;
    $editor[0].selectionEnd = start + timeDateStr.length;
    isModified = true;
    updateTitle();
}

// 查找功能
function findText() {
    const $currentWindow = $(window.frameElement).closest('.win-window');

    const findDialogHTML = `
        <div class="find-dialog">
            <div class="find-dialog-row">
                <label for="find-input">查找内容(N):</label>
                <input type="text" id="find-input" class="find-input" placeholder="输入要查找的文本" autofocus>
            </div>
            <div class="find-dialog-options">
                <label class="find-option">
                    <input type="checkbox" id="match-case"> 区分大小写(C)
                </label>
                <label class="find-option">
                    <input type="checkbox" id="wrap-around"> 循环查找(W)
                </label>
                <label class="find-option">
                    <input type="radio" name="direction" value="up" id="direction-up"> 向上(U)
                </label>
                <label class="find-option">
                    <input type="radio" name="direction" value="down" id="direction-down" checked> 向下(D)
                </label>
            </div>
        </div>
    `;

    window.parent.MessageBoxManager.showCustom({
        title: '查找',
        parentWindow: $currentWindow,
        width: '400px',
        height: '220px',
        customContent: findDialogHTML,
        onShow: function () {
            setTimeout(() => {
                $('#find-input').focus();

                $('#find-input').on('keypress', function (e) {
                    if (e.key === 'Enter') {
                        $('.win-message-box-button.primary').click();
                    }
                });
            }, 200);
        },
        callback: function (result, data) {
            if (result === 'ok') {
                const searchText = $('#find-input').val();
                if (!searchText) {
                    window.parent.MessageBoxManager.info(
                        '请输入要查找的内容',
                        '查找',
                        null,
                        $currentWindow
                    );
                    return;
                }

                const matchCase = $('#match-case').is(':checked');
                const direction = $('input[name="direction"]:checked').val();
                const wrapAround = $('#wrap-around').is(':checked');

                performFind(searchText, matchCase, direction, wrapAround, $currentWindow);
            }
        }
    });
}

function findNext() {
    const $currentWindow = $(window.frameElement).closest('.win-window');
    window.parent.MessageBoxManager.info(
        '查找下一个功能正在开发中',
        '记事本',
        null,
        $currentWindow
    );
}

function performFind(searchText, matchCase, direction, wrapAround, $parentWindow) {
    const editorEl = $editor[0];
    const content = $editor.val();
    const currentPos = editorEl.selectionStart;

    let foundIndex = -1;

    if (!matchCase) {
        const lowerContent = content.toLowerCase();
        const lowerSearch = searchText.toLowerCase();

        if (direction === 'down') {
            foundIndex = lowerContent.indexOf(lowerSearch, currentPos);
            if (foundIndex === -1 && wrapAround) {
                foundIndex = lowerContent.indexOf(lowerSearch, 0);
            }
        } else {
            const lastPart = lowerContent.substring(0, currentPos);
            foundIndex = lastPart.lastIndexOf(lowerSearch);
            if (foundIndex === -1 && wrapAround) {
                foundIndex = lowerContent.lastIndexOf(lowerSearch);
            }
        }
    } else {
        if (direction === 'down') {
            foundIndex = content.indexOf(searchText, currentPos);
            if (foundIndex === -1 && wrapAround) {
                foundIndex = content.indexOf(searchText, 0);
            }
        } else {
            const lastPart = content.substring(0, currentPos);
            foundIndex = lastPart.lastIndexOf(searchText);
            if (foundIndex === -1 && wrapAround) {
                foundIndex = content.lastIndexOf(searchText);
            }
        }
    }

    if (foundIndex !== -1) {
        editorEl.selectionStart = foundIndex;
        editorEl.selectionEnd = foundIndex + searchText.length;
        editorEl.focus();
    } else {
        window.parent.MessageBoxManager.info(
            `找不到 "${searchText}"`,
            '记事本',
            null,
            $parentWindow
        );
    }
}

// 替换功能
function replaceText() {
    const $currentWindow = $(window.frameElement).closest('.win-window');

    const replaceDialogHTML = `
        <div class="replace-dialog">
            <div class="replace-dialog-row">
                <label for="find-input">查找内容(N):</label>
                <input type="text" id="find-input" class="find-input" placeholder="输入要查找的文本">
            </div>
            <div class="replace-dialog-row">
                <label for="replace-input">替换为(P):</label>
                <input type="text" id="replace-input" class="replace-input" placeholder="输入替换的文本">
            </div>
            <div class="replace-dialog-options">
                <label class="find-option">
                    <input type="checkbox" id="match-case"> 区分大小写(C)
                </label>
                <label class="find-option">
                    <input type="checkbox" id="wrap-around"> 循环查找(W)
                </label>
            </div>
        </div>
    `;

    window.parent.MessageBoxManager.showCustom({
        title: '替换',
        parentWindow: $currentWindow,
        width: '450px',
        height: '260px',
        customContent: replaceDialogHTML,
        onShow: function () {
            setTimeout(() => {
                $('#find-input').focus();

                const $buttons = $('.win-message-box-buttons');

                const $findNextBtn = $('<button class="win-message-box-button" id="find-next-btn">查找下一个(F)</button>');
                $findNextBtn.insertBefore($('.win-message-box-button.primary'));

                const $replaceAllBtn = $('<button class="win-message-box-button" id="replace-all-btn">全部替换(A)</button>');
                $replaceAllBtn.insertAfter($('.win-message-box-button.primary'));

                $findNextBtn.click(function () {
                    const searchText = $('#find-input').val();
                    if (!searchText) {
                        window.parent.MessageBoxManager.info(
                            '请输入要查找的内容',
                            '替换',
                            null,
                            $currentWindow
                        );
                        return;
                    }

                    const matchCase = $('#match-case').is(':checked');
                    const wrapAround = $('#wrap-around').is(':checked');

                    performFind(searchText, matchCase, 'down', wrapAround, $currentWindow);
                });

                $replaceAllBtn.click(function () {
                    const searchText = $('#find-input').val();
                    const replaceText = $('#replace-input').val();

                    if (!searchText) {
                        window.parent.MessageBoxManager.info(
                            '请输入要查找的内容',
                            '替换',
                            null,
                            $currentWindow
                        );
                        return;
                    }

                    const matchCase = $('#match-case').is(':checked');
                    performReplaceAll(searchText, replaceText, matchCase, $currentWindow);
                });

                $('#find-input, #replace-input').on('keypress', function (e) {
                    if (e.key === 'Enter') {
                        $('#find-next-btn').click();
                    }
                });
            }, 200);
        },
        callback: function (result, data) {
            if (result === 'ok') {
                const searchText = $('#find-input').val();
                const replaceText = $('#replace-input').val();

                if (!searchText) {
                    window.parent.MessageBoxManager.info(
                        '请输入要查找的内容',
                        '替换',
                        null,
                        $currentWindow
                    );
                    return;
                }

                const matchCase = $('#match-case').is(':checked');
                performReplace(searchText, replaceText, matchCase, $currentWindow);
            }
        }
    });
}

function performReplace(searchText, replaceText, matchCase, $parentWindow) {
    const editorEl = $editor[0];
    const content = $editor.val();
    const currentPos = editorEl.selectionStart;
    const selectedText = content.substring(editorEl.selectionStart, editorEl.selectionEnd);

    let isMatch = false;
    if (!matchCase) {
        isMatch = selectedText.toLowerCase() === searchText.toLowerCase();
    } else {
        isMatch = selectedText === searchText;
    }

    if (isMatch && selectedText.length === searchText.length) {
        const newContent = content.substring(0, editorEl.selectionStart) +
            replaceText +
            content.substring(editorEl.selectionEnd);
        $editor.val(newContent);

        const newPos = editorEl.selectionStart + replaceText.length;
        editorEl.selectionStart = newPos;
        editorEl.selectionEnd = newPos;

        isModified = true;
        updateTitle();
    }

    performFind(searchText, matchCase, 'down', true, $parentWindow);
}

function performReplaceAll(searchText, replaceText, matchCase, $parentWindow) {
    const content = $editor.val();
    let newContent;
    let count = 0;

    if (!matchCase) {
        const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        newContent = content.replace(regex, function (match) {
            count++;
            return replaceText;
        });
    } else {
        const regex = new RegExp(searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        newContent = content.replace(regex, function (match) {
            count++;
            return replaceText;
        });
    }

    if (count > 0) {
        $editor.val(newContent);
        isModified = true;
        updateTitle();

        window.parent.MessageBoxManager.success(
            `已完成 ${count} 处替换。`,
            '替换',
            null,
            $parentWindow
        );
    } else {
        window.parent.MessageBoxManager.info(
            `找不到 "${searchText}"`,
            '替换',
            null,
            $parentWindow
        );
    }
}

// 格式操作函数
function toggleWordWrap() {
    isWordWrap = !isWordWrap;
    $editor.css('whiteSpace', isWordWrap ? 'pre-wrap' : 'pre');
    $('#word-wrap').css('fontWeight', isWordWrap ? 'bold' : 'normal');
}

function changeFont() {
    const $currentWindow = $(window.frameElement).closest('.win-window');

    window.parent.MessageBoxManager.showFontDialog({
        currentFont: $editor.css('fontFamily').replace(/['"]/g, ''),
        currentSize: parseInt($editor.css('fontSize')) || 16,
        parentWindow: $currentWindow,
        callback: function (result) {
            if (result) {
                let fontWeight = 'normal';
                let fontStyle = 'normal';

                if (result.fontStyle === 'bold') fontWeight = 'bold';
                else if (result.fontStyle === 'italic') fontStyle = 'italic';
                else if (result.fontStyle === 'bold italic') {
                    fontWeight = 'bold';
                    fontStyle = 'italic';
                }

                $editor.css({
                    'fontFamily': result.fontFamily,
                    'fontSize': result.fontSize + 'px',
                    'fontWeight': fontWeight,
                    'fontStyle': fontStyle
                });

                fontSize = result.fontSize;
            }
        }
    });
}

// 查看操作函数
function zoomIn() {
    fontSize += 2;
    $editor.css('fontSize', fontSize + 'px');
}

function zoomOut() {
    fontSize = Math.max(8, fontSize - 2);
    $editor.css('fontSize', fontSize + 'px');
}

function restoreZoom() {
    fontSize = 16;
    $editor.css('fontSize', fontSize + 'px');
}

function toggleStatusBar() {
    isStatusBarVisible = !isStatusBarVisible;
    $statusBar.css('display', isStatusBarVisible ? 'flex' : 'none');
    $('#status-bar').css('fontWeight', isStatusBarVisible ? 'bold' : 'normal');
}

// 帮助操作函数
function viewHelp() {
    const $currentWindow = $(window.frameElement).closest('.win-window');
    window.parent.MessageBoxManager.info(
        '帮助文档正在准备中...\n\n您可以访问我们的网站获取更多帮助。',
        '帮助',
        null,
        $currentWindow
    );
}

function showAbout() {
    const $currentWindow = $(window.frameElement).closest('.win-window');
    window.parent.MessageBoxManager.info(
        '记事本\n\n版本 1.0\n© 2026\n\n基于Web的Windows风格记事本应用\n\n支持通过URL参数加载文件内容',
        '关于',
        null,
        $currentWindow
    );
}

// 窗口关闭处理
function setupWindowCloseHandler() {
    const $winWindow = $(window.frameElement).closest('.win-window');

    $winWindow.on('beforeClose', function (e) {
        e.preventDefault();

        if (isModified) {
            const $currentWindow = $(this);

            window.parent.MessageBoxManager.confirmCancel(
                '是否将更改保存到？',
                '记事本',
                function (result) {
                    if (result === 'ok') {
                        saveFile();
                        setTimeout(() => {
                            $winWindow.find('.win-window-close').off('click').click();
                        }, 100);
                    } else if (result === 'no') {
                        $winWindow.find('.win-window-close').off('click').click();
                    }
                },
                $currentWindow
            );
        } else {
            $winWindow.find('.win-window-close').off('click').click();
        }
    });

    $winWindow.find('.win-window-close').off('click').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $winWindow.trigger('beforeClose');
    });
}

function initWindowCloseHandler() {
    setTimeout(() => {
        setupWindowCloseHandler();
    }, 500);
}

// 更新函数
function updateTitle() {
    const fileName = currentFile ? currentFile.name : '无标题';
    const title = fileName + (isModified ? ' *' : '') + ' - 记事本';
    document.title = title;
}

function updateLineColInfo() {
    const editorEl = $editor[0];
    const text = $editor.val().substring(0, editorEl.selectionStart);
    const lines = text.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;

    $lineColInfo.text(`第${line}行, 第${col}列`);
}

// 添加CSS样式
const styleHTML = `
    <style>
        .filename-dialog {
            padding: 20px;
        }
        
        .filename-dialog-row {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .filename-dialog-row label {
            width: 70px;
            text-align: right;
            font-size: 14px;
        }
        
        .filename-input {
            flex: 1;
            padding: 5px 8px;
            border: 1px solid #ccc;
            border-radius: 3px;
            font-size: 14px;
        }
        
        .filename-input:focus {
            outline: none;
            border-color: #0078d4;
            box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.3);
        }
        
        .find-dialog,
        .replace-dialog {
            padding: 15px;
        }
        
        .find-dialog-row,
        .replace-dialog-row {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .find-dialog-row label,
        .replace-dialog-row label {
            width: 80px;
            text-align: right;
            font-size: 14px;
        }
        
        .find-input,
        .replace-input {
            flex: 1;
            padding: 5px 8px;
            border: 1px solid #ccc;
            border-radius: 3px;
            font-size: 14px;
        }
        
        .find-input:focus,
        .replace-input:focus {
            outline: none;
            border-color: #0078d4;
            box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.3);
        }
        
        .find-dialog-options,
        .replace-dialog-options {
            margin-left: 90px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .find-option {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 13px;
            cursor: default;
        }
        
        .find-option input[type="checkbox"],
        .find-option input[type="radio"] {
            margin: 0;
            cursor: default;
        }
        
        #find-next-btn,
        #replace-all-btn {
            margin: 0 5px;
        }
    </style>
`;

// 添加样式到页面
$('head').append(styleHTML);

// 初始化应用
$(document).ready(function () {
    ImageErrorHandler.init();
    initEditor();
});