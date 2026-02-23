"use strict";

/**
 * 窗口管理器组件
 */
const WindowManager = {
    windows: [],
    zIndex: 1000,
    taskbarItems: {},
    windowEvents: {},
    loadingCursors: new Set(), // 跟踪正在加载的窗口

    // 初始化窗口管理器
    init: function () {
        // 设置消息监听
        window.addEventListener('message', (e) => {
            if (e.data && e.data.type === 'window-command') {
                const win = this.windows.find(w => w.id === e.data.windowId);
                if (win) {
                    // 处理来自iframe的命令
                    this.emit('window-command', {
                        window: win,
                        command: e.data.command,
                        data: e.data.data
                    });
                }
            }
        });
    },

    createWindow: function (options) {
        const windowId = 'win-' + Date.now();
        const windowHtml = `
                <div class="win-window" id="${windowId}" data-app="${options.appName}">
                    <div class="win-window-titlebar">
                        <div class="win-window-title">${options.title}</div>
                        <div class="win-window-controls">
                            <button class="win-window-minimize">🗕</button>
                            <button class="win-window-maximize">🗗</button>
                            <button class="win-window-close">✕</button>
                        </div>
                    </div>
                    <div class="win-window-content">
                        ${options.content || `<iframe src="${options.url}" frameborder="0" style="width:100%;height:100%;"></iframe>`}
                    </div>
                </div>
            `;
        $('body').append(windowHtml);

        const $window = $('#' + windowId);

        // 如果有URL，设置加载状态
        if (options.url) {
            this.loadingCursors.add(windowId);
            $('body').css('cursor', 'wait');
        }

        // 使用jQuery UI使窗口可拖动和调整大小
        $window.draggable({
            handle: '.win-window-titlebar',
            start: () => {
                $window.css('zIndex', this.zIndex++);
            }
        }).resizable({
            minWidth: 300,
            minHeight: 200
        });

        // 设置初始位置和大小
        $window.css({
            position: 'absolute',
            left: options.x || '100px',
            top: options.y || '100px',
            width: options.width || '800px',
            height: options.height || '600px',
            zIndex: this.zIndex++,
            display: 'none' // 初始隐藏
        });

        // 添加窗口控制功能
        this.addWindowControls($window);

        // 添加到窗口列表
        this.windows.push({
            id: windowId,
            element: $window,
            appName: options.appName,
            title: options.title
        });

        // 更新任务栏
        this.updateTaskbar($window, options.appName);

        // 设置iframe通信和加载检测
        if (options.url) {
            const iframe = $window.find('iframe')[0];

            // 加载开始事件
            $(iframe).on('loadstart', () => {
                $('body').css('cursor', 'wait');
            });

            // 加载完成事件
            iframe.onload = () => {
                $window.show();
                // 从加载集合中移除
                this.loadingCursors.delete(windowId);
                if (this.loadingCursors.size === 0) {
                    $('body').css('cursor', 'default');
                }

                // 发送窗口信息
                iframe.contentWindow.postMessage({
                    type: 'window-info',
                    windowId: windowId,
                    appName: options.appName
                }, '*');
            };

            // 加载错误处理
            $(iframe).on('error', () => {
                $window.find('.win-window-content').html(`
                    <div style="padding: 20px; text-align: center; color: red;">
                        加载失败：无法打开应用
                    </div>
                `);
                $window.fadeIn(300);

                this.loadingCursors.delete(windowId);
                if (this.loadingCursors.size === 0) {
                    $('body').css('cursor', 'default');
                }
            });
        } else {
            // 如果没有URL，直接显示
            $window.fadeIn(300);
        }

        // 点击窗口时置顶
        $window.click(() => {
            this.bringToFront(windowId);
        });

        return $window;
    },

    // 窗口置顶
    bringToFront: function (windowId) {
        const window = this.windows.find(w => w.id === windowId);
        if (window) {
            window.element.css('zIndex', this.zIndex++);
            this.updateTaskbarItemsState();
        }
    },

    // 更新任务栏
    updateTaskbar: function ($window, appName) {
        const windowCount = this.windows.filter(w => w.appName === appName).length;
        let $taskbarItem = this.taskbarItems[appName];

        if (windowCount > 1) {
            $taskbarItem.find('img').after(`<span class="window-count">${windowCount}</span>`);
        }

        if (!$taskbarItem) {
            // 获取应用图标
            const iconSrc = $(`.desktop-icon[data-name="${appName.toLowerCase().replace(' ', '-')}"] img`).attr('src') ||
                `StaticResources/Icons/${appName.toLowerCase().replace(' ', '-')}.png`;

            $taskbarItem = $(`
                <div class="win-taskbar-item" data-app="${appName}">
                    <img src="${iconSrc}" alt="${appName}">
                    <span class="taskbar-item-title">${appName}</span>
                </div>
            `).appendTo('#win-list');

            this.taskbarItems[appName] = $taskbarItem;

            // 添加点击事件
            $taskbarItem.click(() => {
                const windowsForApp = this.windows.filter(w => w.appName === appName);

                if (windowsForApp.length > 0) {
                    const $win = windowsForApp[0].element;
                    if ($win.hasClass('minimized')) {
                        $win.removeClass('minimized');
                        $win.css('zIndex', this.zIndex++);
                    } else {
                        windowsForApp.forEach(w => w.element.addClass('minimized'));
                    }
                    this.updateTaskbarItemsState();
                }
            });
        }

        // 更新所有任务栏项目状态
        this.updateTaskbarItemsState();
    },

    // 更新所有任务栏项目状态
    updateTaskbarItemsState: function () {
        $('.win-taskbar-item').removeClass('active');

        this.windows.forEach(win => {
            if (!win.element.hasClass('minimized') && !win.element.hasClass('window-loading')) {
                this.taskbarItems[win.appName]?.addClass('active');
            }
        });
    },

    // 窗口控制功能
    addWindowControls: function ($window) {
        // 关闭按钮
        $window.find('.win-window-close').click(() => {
            const appName = $window.data('app');
            const windowId = $window.attr('id');

            // 从加载集合中移除
            this.loadingCursors.delete(windowId);
            if (this.loadingCursors.size === 0) {
                $('body').css('cursor', 'default');
            }

            $window.remove();
            this.windows = this.windows.filter(w => w.id !== $window.attr('id'));

            // 如果没有其他相同应用的窗口，移除任务栏项目
            if (!this.windows.some(w => w.appName === appName)) {
                this.taskbarItems[appName]?.remove();
                delete this.taskbarItems[appName];
            }

            this.updateTaskbarItemsState();
        });

        // 最小化按钮
        $window.find('.win-window-minimize').click(() => {
            if ($window.hasClass('minimized')) {
                $window.removeClass('minimized');
            } else {
                $window.addClass('minimized');
            }
            this.updateTaskbarItemsState();
        });

        // 最大化按钮
        $window.find('.win-window-maximize').click(() => {
            $window.toggleClass('maximized');
            if ($window.hasClass('maximized')) {
                $window.css({
                    left: '0',
                    top: '0',
                    width: '100%',
                    height: 'calc(100dvh - 40px)'
                });
            } else {
                $window.css({
                    left: '100px',
                    top: '100px',
                    width: '800px',
                    height: '600px'
                });
            }
            $window.css('zIndex', this.zIndex++);
        });
    },

    ungroupWindows: function (groupId) {
        const windows = this.windows.filter(w => w.groupId === groupId);

        windows.forEach(win => {
            win.element.appendTo('body');
            delete win.groupId;
        });

        $(`.win-window-group#${groupId}`).remove();
    },

    // 窗口状态持久化
    saveWindowState: function () {
        const state = this.windows.map(win => ({
            id: win.id,
            appName: win.appName,
            title: win.title,
            position: win.element.position(),
            size: {
                width: win.element.width(),
                height: win.element.height()
            },
            isMaximized: win.element.hasClass('maximized'),
            isMinimized: win.element.hasClass('minimized')
        }));

        localStorage.setItem('windowState', JSON.stringify(state));
    },

    restoreWindowState: function () {
        const saved = localStorage.getItem('windowState');
        if (!saved) return;

        try {
            const state = JSON.parse(saved);
            state.forEach(s => {
                const win = this.createWindow({
                    title: s.title,
                    appName: s.appName,
                    x: s.position.left,
                    y: s.position.top,
                    width: s.size.width,
                    height: s.size.height
                });

                if (s.isMaximized) win.addClass('maximized');
                if (s.isMinimized) win.addClass('minimized');
            });
        } catch (e) {
            console.error('Failed to restore window state:', e);
        }
    },

    // 窗口通信功能
    on: function (eventName, callback) {
        if (!this.windowEvents[eventName]) {
            this.windowEvents[eventName] = [];
        }
        this.windowEvents[eventName].push(callback);
    },

    emit: function (eventName, data) {
        if (this.windowEvents[eventName]) {
            this.windowEvents[eventName].forEach(cb => cb(data));
        }
    },

    // 打开应用
    openApp: function (input) {
        let appName = '';
        let appUrl = '';
        let appId = '';
        let appIcon = '';

        // 判断输入类型
        if (input instanceof jQuery || input.nodeType === 1) {
            // 处理DOM元素
            const $element = $(input);
            appName = $element.find('span').text();
            appUrl = $element.data('appurl');
            appId = $element.data('name');
            appIcon = $element.data('icon') || $element.find('img').attr('src') || '';
        } else if (typeof input === 'object') {
            // 处理对象参数
            appName = input.name || '';
            appUrl = input.url || '';
            appId = input.id || '';
            appIcon = input.icon || '';
        }

        // 标准化应用名称
        const normalizedAppName = appId ?
            appId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') :
            appName;

        // 检查是否已经打开
        const existingWindows = this.windows.filter(w => w.appName === normalizedAppName);
        if (existingWindows.length > 0) {
            existingWindows.forEach(win => {
                if (win.element.hasClass('minimized')) {
                    win.element.removeClass('minimized');
                    win.element.css('zIndex', this.zIndex++);
                } else {
                    win.element.css('zIndex', this.zIndex++);
                }
            });
            this.updateTaskbarItemsState();
            return;
        }

        // 创建新窗口（带加载检测）
        this.createWindow({
            title: normalizedAppName,
            url: appUrl,
            appName: normalizedAppName,
            icon: appIcon,
            width: '800px',
            height: '600px'
        });
    }
};

export { WindowManager }