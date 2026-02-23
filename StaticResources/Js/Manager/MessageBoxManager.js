"use strict";

/**
 * 消息框管理器组件
 */
const MessageBoxManager = {
    // 默认图标路径
    icons: {
        info: 'info',
        warning: 'warning',
        error: 'error',
        success: 'success',
        question: 'question',
        NONE: 'none'
    },

    // 消息框类型
    types: {
        OK: 'ok',
        OK_CANCEL: 'okcancel',
        YES_NO: 'yesno',
        YES_NO_CANCEL: 'yesnocancel',
        RETRY_CANCEL: 'retrycancel',
        ABORT_RETRY_IGNORE: 'abortretryignore'
    },

    // 消息框结果
    result: {
        OK: 'ok',
        CANCEL: 'cancel',
        YES: 'yes',
        NO: 'no',
        RETRY: 'retry',
        ABORT: 'abort',
        IGNORE: 'ignore'
    },

    // 当前活动消息框列表
    activeMessageBoxes: [],

    // 全局 z-index 基准
    baseZIndex: 1000000,

    // 活动消息框对应的任务栏项目
    taskbarItems: {},

    /**
     * 显示消息框
     * @param {Object} options 配置选项
     * @returns {Promise}
     */
    show: function (options = {}) {
        // 默认配置
        const config = {
            title: options.title || 'Windows',
            message: options.message || '',
            type: options.type || this.types.OK,
            icon: options.icon || this.icons.NONE,
            callback: options.callback || null,
            draggable: options.draggable !== false,
            defaultButton: options.defaultButton || null,
            parentWindow: options.parentWindow || null,
            modal: options.modal || false,
            showInTaskbar: options.showInTaskbar !== false,
            customContent: options.customContent || null,
            width: options.width || 'auto',
            height: options.height || 'auto',
            onShow: options.onShow || null,
            onClose: options.onClose || null
        };

        // 创建消息框
        const messageBox = this._createMessageBox(config);

        // 添加到活动列表
        this.activeMessageBoxes.push(messageBox);

        // 显示消息框
        messageBox.show();

        // 添加到任务栏
        if (config.showInTaskbar) {
            this._addToTaskbar(messageBox, config);
        }

        // 返回Promise
        return new Promise((resolve) => {
            messageBox.onResult = (result, data) => {
                // 从任务栏移除
                this._removeFromTaskbar(messageBox.id);

                // 从活动列表中移除
                const index = this.activeMessageBoxes.indexOf(messageBox);
                if (index > -1) {
                    this.activeMessageBoxes.splice(index, 1);
                }

                if (config.callback) {
                    config.callback(result, data);
                }
                resolve({ result, data });
            };
        });
    },

    /**
     * 显示自定义对话框
     * @param {Object} options 配置选项
     * @returns {Promise}
     */
    showCustom: function (options) {
        return this.show({
            type: this.types.OK_CANCEL,
            ...options,
            customContent: options.customContent || true  // 如果没有提供customContent，默认为true
        });
    },

    /**
     * 显示字体对话框
     * @param {Object} options 配置选项
     * @returns {Promise}
     */
    showFontDialog: function (options = {}) {
        const defaultOptions = {
            currentFont: options.currentFont || 'Consolas',
            currentSize: options.currentSize || 16,
            currentStyle: options.currentStyle || 'regular',
            fontFamilies: options.fontFamilies || [
                'Consolas', 'Monaco', 'Courier New', 'Arial',
                '微软雅黑', '宋体', '黑体', 'Times New Roman',
                'Georgia', 'Verdana', 'Helvetica', 'Tahoma'
            ],
            fontSizes: options.fontSizes || [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72],
            fontStyles: options.fontStyles || [
                { value: 'regular', text: '常规' },
                { value: 'bold', text: '粗体' },
                { value: 'italic', text: '斜体' },
                { value: 'bold italic', text: '粗斜体' }
            ]
        };

        // 生成实际的HTML内容
        const customContent = this._generateFontDialogHTML(defaultOptions);

        return this.showCustom({
            title: options.title || '字体',
            parentWindow: options.parentWindow || null,
            width: options.width || '450px',
            height: options.height || '400px',
            customContent: customContent,  // 这里传入实际的HTML字符串
            onShow: function (messageBox) {
                // 绑定预览更新事件
                setTimeout(() => {
                    $('#font-family-select, #font-style-select, #font-size-select').on('change', function () {
                        const family = $('#font-family-select').val();
                        const size = $('#font-size-select').val();
                        const style = $('#font-style-select').val();

                        let fontWeight = 'normal';
                        let fontStyle = 'normal';

                        if (style === 'bold') fontWeight = 'bold';
                        else if (style === 'italic') fontStyle = 'italic';
                        else if (style === 'bold italic') {
                            fontWeight = 'bold';
                            fontStyle = 'italic';
                        }

                        $('#font-preview').css({
                            'fontFamily': family,
                            'fontSize': size + 'px',
                            'fontWeight': fontWeight,
                            'fontStyle': fontStyle
                        });
                    }).trigger('change');
                }, 200);
            },
            callback: function (result, data) {
                if (result === 'ok' && options.callback) {
                    const selectedFont = $('#font-family-select').val();
                    const selectedSize = parseInt($('#font-size-select').val());
                    const selectedStyle = $('#font-style-select').val();

                    options.callback({
                        fontFamily: selectedFont,
                        fontSize: selectedSize,
                        fontStyle: selectedStyle
                    });
                }
            }
        });
    },

    /**
     * 生成字体对话框HTML
     * @private
     */
    _generateFontDialogHTML: function (options) {
        const fontFamilies = options.fontFamilies.map(f =>
            `<option value="${f}" ${f === options.currentFont ? 'selected' : ''}>${f}</option>`
        ).join('');

        const fontSizes = options.fontSizes.map(s =>
            `<option value="${s}" ${s === options.currentSize ? 'selected' : ''}>${s}</option>`
        ).join('');

        const fontStyles = options.fontStyles.map(s =>
            `<option value="${s.value}" ${s.value === options.currentStyle ? 'selected' : ''}>${s.text}</option>`
        ).join('');

        return `
            <div class="font-dialog">
                <div class="font-dialog-row">
                    <div class="font-dialog-label">字体(F):</div>
                    <div class="font-dialog-field">
                        <select id="font-family-select" size="10" class="font-family-select">
                            ${fontFamilies}
                        </select>
                    </div>
                </div>
                <div class="font-dialog-row">
                    <div class="font-dialog-label">字形(Y):</div>
                    <div class="font-dialog-field">
                        <select id="font-style-select" size="5" class="font-style-select">
                            ${fontStyles}
                        </select>
                    </div>
                </div>
                <div class="font-dialog-row">
                    <div class="font-dialog-label">大小(S):</div>
                    <div class="font-dialog-field">
                        <select id="font-size-select" size="5" class="font-size-select">
                            ${fontSizes}
                        </select>
                    </div>
                </div>
                <div class="font-dialog-preview">
                    <div class="font-dialog-label">示例:</div>
                    <div class="font-preview-box" id="font-preview">
                        AaBbYyZz 123
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * 添加消息框到任务栏
     * @private
     */
    _addToTaskbar: function (messageBox, config) {
        const self = this;
        const messageBoxId = messageBox.id;

        // 确定图标
        let iconSrc = 'StaticResources/Icons/info.png';
        if (config.icon && config.icon !== this.icons.NONE) {
            switch (config.icon) {
                case this.icons.info:
                    iconSrc = 'StaticResources/Icons/info.png';
                    break;
                case this.icons.warning:
                    iconSrc = 'StaticResources/Icons/warning.png';
                    break;
                case this.icons.error:
                    iconSrc = 'StaticResources/Icons/error.ico';
                    break;
                case this.icons.question:
                    iconSrc = 'StaticResources/Icons/question.png';
                    break;
                case this.icons.success:
                    iconSrc = 'StaticResources/Icons/info.png';
                    break;
            }
        }

        // 创建任务栏项目
        const $taskbarItem = $(`
            <div class="win-taskbar-item messagebox-taskbar-item" data-messagebox="${messageBoxId}">
                <img src="${iconSrc}" alt="消息框">
                <span class="taskbar-item-title">${config.title}</span>
            </div>
        `).appendTo('#win-list');

        // 添加点击事件
        $taskbarItem.click(function (e) {
            e.stopPropagation();

            const $msgBox = $('#' + messageBoxId);
            if ($msgBox.length) {
                if ($msgBox.hasClass('minimized')) {
                    $msgBox.removeClass('minimized').show();
                    messageBox.bringToFront();
                } else {
                    messageBox.bringToFront();
                }

                $msgBox.addClass('messagebox-flash');
                setTimeout(() => {
                    $msgBox.removeClass('messagebox-flash');
                }, 500);

                self._updateTaskbarMessageBoxState(messageBoxId, true);

                self.activeMessageBoxes.forEach(box => {
                    if (box.id !== messageBoxId) {
                        self._updateTaskbarMessageBoxState(box.id, false);
                    }
                });
            }
        });

        this.taskbarItems[messageBoxId] = $taskbarItem;

        this._setupMessageBoxStateListener(messageBox);

        setTimeout(() => {
            this._updateTaskbarMessageBoxState(messageBoxId, true);
        }, 100);
    },

    /**
     * 从任务栏移除消息框
     * @private
     */
    _removeFromTaskbar: function (messageBoxId) {
        if (this.taskbarItems[messageBoxId]) {
            this.taskbarItems[messageBoxId].fadeOut(150, function () {
                $(this).remove();
            });
            delete this.taskbarItems[messageBoxId];
        }
    },

    /**
     * 更新任务栏消息框状态
     * @private
     */
    _updateTaskbarMessageBoxState: function (messageBoxId, isActive) {
        const $taskbarItem = this.taskbarItems[messageBoxId];
        if ($taskbarItem) {
            if (isActive) {
                $taskbarItem.addClass('active');
            } else {
                $taskbarItem.removeClass('active');
            }
        }
    },

    /**
     * 设置消息框状态监听
     * @private
     */
    _setupMessageBoxStateListener: function (messageBox) {
        const self = this;
        const messageBoxId = messageBox.id;

        messageBox.element.on('click focusin', function () {
            setTimeout(() => {
                const isMinimized = messageBox.element.hasClass('minimized');
                if (!isMinimized) {
                    self._updateTaskbarMessageBoxState(messageBoxId, true);

                    self.activeMessageBoxes.forEach(box => {
                        if (box.id !== messageBoxId) {
                            self._updateTaskbarMessageBoxState(box.id, false);
                        }
                    });
                }
            }, 10);
        });

        messageBox.element.on('remove', function () {
            self._removeFromTaskbar(messageBoxId);
        });
    },

    /**
     * 创建消息框DOM
     * @private
     */
    _createMessageBox: function (config) {
        const self = this;
        const messageBox = {
            element: null,
            id: 'msgbox-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            isDragging: false,
            dragOffset: { x: 0, y: 0 },
            zIndex: self.baseZIndex + self.activeMessageBoxes.length,

            /**
             * 显示消息框
             */
            show: function () {
                // 在 _createMessageBox 方法的 show 函数中，找到这部分代码：
                let contentHtml = '';

                if (config.customContent) {
                    // 这里需要判断 customContent 是字符串还是布尔值
                    if (typeof config.customContent === 'string') {
                        contentHtml = config.customContent;
                    } else {
                        // 如果是 true，表示使用默认的字体对话框
                        contentHtml = this._generateFontDialogHTML({
                            currentFont: 'Consolas',
                            currentSize: 16,
                            currentStyle: 'regular'
                        });
                    }
                } else {
                    const iconHtml = config.icon !== self.icons.NONE
                        ? `<div class="win-message-box-icon ${config.icon}">
            <img src="${self._getIconPath(config.icon)}" alt="${config.icon}">
           </div>`
                        : '';

                    contentHtml = `
        ${iconHtml}
        <div class="win-message-box-text">${this._formatMessage(config.message)}</div>
    `;
                }

                const buttonsHtml = this._generateButtons(config.type);

                const messageBoxHtml = `
                    <div class="win-message-box acrylic-effect" id="${this.id}" style="z-index: ${this.zIndex}; width: ${config.width}; height: ${config.height};">
                        <div class="win-message-box-titlebar">
                            <div class="win-message-box-title">
                                <span>${this._escapeHtml(config.title)}</span>
                            </div>
                            <button class="win-message-box-close">✕</button>
                        </div>
                        <div class="win-message-box-content ${config.customContent ? 'custom-content' : ''}">
                            ${contentHtml}
                        </div>
                        <div class="win-message-box-buttons">
                            ${buttonsHtml}
                        </div>
                    </div>
                `;

                $('body').append(messageBoxHtml);

                // 获取元素引用
                this.element = $('#' + this.id);
                const $titlebar = this.element.find('.win-message-box-titlebar');
                const $closeBtn = this.element.find('.win-message-box-close');

                // 定位
                if (config.modal && config.parentWindow) {
                    this._positionRelativeToParent(config.parentWindow);
                } else {
                    this._centerToScreen();
                }

                // 添加动画效果
                this.element.css({
                    'transform': 'scale(0.85)',
                    'opacity': '0',
                    'transform-origin': 'center center',
                    'transition': 'none'
                });

                this.element[0].offsetHeight;

                this.element.css({
                    'transition': 'transform 0.12s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.08s ease-out',
                    'transform': 'scale(1)',
                    'opacity': '1'
                });

                // 设置拖动
                if (config.draggable) {
                    this._makeDraggable($titlebar);
                }

                // 点击消息框时置顶
                this.element.click(() => {
                    this.bringToFront();

                    setTimeout(() => {
                        self._updateTaskbarMessageBoxState(this.id, true);

                        self.activeMessageBoxes.forEach(box => {
                            if (box.id !== this.id) {
                                self._updateTaskbarMessageBoxState(box.id, false);
                            }
                        });
                    }, 10);
                });

                // 关闭按钮事件
                $closeBtn.click(() => {
                    this.close();
                    if (messageBox.onResult) {
                        messageBox.onResult(self.result.CANCEL);
                    }
                });

                // 按钮事件
                this.element.find('.win-message-box-button').click((e) => {
                    const result = $(e.target).data('result');
                    let customData = null;

                    // 如果是自定义对话框，收集数据
                    if (config.customContent) {
                        customData = this.getCustomData();
                    }

                    $(e.target).css({
                        'transition': 'transform 0.05s ease-out',
                        'transform': 'scale(0.95)'
                    });

                    setTimeout(() => {
                        $(e.target).css('transform', 'scale(1)');
                    }, 50);

                    setTimeout(() => {
                        this.close();
                        if (messageBox.onResult) {
                            messageBox.onResult(result, customData);
                        }
                    }, 80);
                });

                // 最小化功能
                $titlebar.on('dblclick', (e) => {
                    e.stopPropagation();
                    this.element.toggleClass('minimized');
                    if (this.element.hasClass('minimized')) {
                        this.element.hide();
                        self._updateTaskbarMessageBoxState(this.id, false);
                    } else {
                        this.element.show();
                        this.bringToFront();
                        self._updateTaskbarMessageBoxState(this.id, true);

                        self.activeMessageBoxes.forEach(box => {
                            if (box.id !== this.id) {
                                self._updateTaskbarMessageBoxState(box.id, false);
                            }
                        });
                    }
                });

                // 设置默认按钮焦点
                this._setDefaultButtonFocus(config.defaultButton);

                // 调用onShow回调
                if (config.onShow) {
                    config.onShow(this);
                }

                return this;
            },

            /**
             * 关闭消息框
             */
            close: function () {
                if (!this.element) return;

                self._removeFromTaskbar(this.id);

                this.element.css({
                    'transition': 'transform 0.1s ease-in, opacity 0.08s ease-in',
                    'transform': 'scale(0.9)',
                    'opacity': '0'
                });

                setTimeout(() => {
                    this.element.remove();
                    if (config.onClose) {
                        config.onClose();
                    }
                }, 100);
            },

            /**
             * 置顶消息框
             */
            bringToFront: function () {
                let maxZIndex = self.baseZIndex;
                self.activeMessageBoxes.forEach(box => {
                    if (box.element) {
                        const zIndex = parseInt(box.element.css('zIndex')) || 0;
                        maxZIndex = Math.max(maxZIndex, zIndex);
                    }
                });

                const newZIndex = maxZIndex + 1;
                this.element.css('zIndex', newZIndex);
                this.zIndex = newZIndex;

                if (this.element.hasClass('minimized')) {
                    this.element.removeClass('minimized').show();
                }
            },

            /**
             * 获取自定义数据
             */
            getCustomData: function () {
                return {
                    fontFamily: $('#font-family-select').val(),
                    fontSize: $('#font-size-select').val(),
                    fontStyle: $('#font-style-select').val()
                };
            },

            /**
             * 居中显示
             * @private
             */
            _centerToScreen: function () {
                const windowWidth = $(window).width();
                const windowHeight = $(window).height();
                const msgWidth = this.element.outerWidth();
                const msgHeight = this.element.outerHeight();

                this.element.css({
                    'left': (windowWidth - msgWidth) / 2 + 'px',
                    'top': (windowHeight - msgHeight) / 2 + 'px',
                    'position': 'absolute'
                });
            },

            /**
             * 相对于父窗口定位
             * @private
             */
            _positionRelativeToParent: function (parentWindow) {
                const parentOffset = parentWindow.offset();
                const parentWidth = parentWindow.outerWidth();
                const parentHeight = parentWindow.outerHeight();
                const msgWidth = this.element.outerWidth();
                const msgHeight = this.element.outerHeight();

                this.element.css({
                    'left': parentOffset.left + (parentWidth - msgWidth) / 2 + 'px',
                    'top': parentOffset.top + (parentHeight - msgHeight) / 2 + 'px',
                    'position': 'absolute'
                });
            },

            /**
             * 生成按钮HTML
             * @private
             */
            _generateButtons: function (type) {
                const buttonConfigs = {
                    [self.types.OK]: [
                        { text: '确定', result: self.result.OK, primary: true }
                    ],
                    [self.types.OK_CANCEL]: [
                        { text: '确定', result: self.result.OK, primary: true },
                        { text: '取消', result: self.result.CANCEL }
                    ],
                    [self.types.YES_NO]: [
                        { text: '是', result: self.result.YES, primary: true },
                        { text: '否', result: self.result.NO }
                    ],
                    [self.types.YES_NO_CANCEL]: [
                        { text: '是', result: self.result.YES, primary: true },
                        { text: '否', result: self.result.NO },
                        { text: '取消', result: self.result.CANCEL }
                    ],
                    [self.types.RETRY_CANCEL]: [
                        { text: '重试', result: self.result.RETRY, primary: true },
                        { text: '取消', result: self.result.CANCEL }
                    ],
                    [self.types.ABORT_RETRY_IGNORE]: [
                        { text: '终止', result: self.result.ABORT },
                        { text: '重试', result: self.result.RETRY, primary: true },
                        { text: '忽略', result: self.result.IGNORE }
                    ]
                };

                const buttons = buttonConfigs[type] || buttonConfigs[self.types.OK];

                return buttons.map(btn =>
                    `<button class="win-message-box-button ${btn.primary ? 'primary' : ''}" data-result="${btn.result}">${btn.text}</button>`
                ).join('');
            },

            /**
             * 使元素可拖动
             * @private
             */
            _makeDraggable: function ($handle) {
                const $element = this.element;

                $handle.on('mousedown', (e) => {
                    if (e.button !== 0) return;

                    e.preventDefault();
                    this.isDragging = true;
                    this.bringToFront();

                    const offset = $element.offset();
                    this.dragOffset = {
                        x: e.pageX - offset.left,
                        y: e.pageY - offset.top
                    };

                    $element.css('cursor', 'move');
                });

                $(document).on('mousemove', (e) => {
                    if (!this.isDragging) return;

                    e.preventDefault();

                    const left = e.pageX - this.dragOffset.x;
                    const top = e.pageY - this.dragOffset.y;

                    const maxLeft = $(window).width() - $element.outerWidth();
                    const maxTop = $(window).height() - $element.outerHeight();

                    $element.css({
                        left: Math.max(0, Math.min(left, maxLeft)) + 'px',
                        top: Math.max(0, Math.min(top, maxTop)) + 'px'
                    });
                });

                $(document).on('mouseup', () => {
                    if (this.isDragging) {
                        this.isDragging = false;
                        $element.css('cursor', '');
                    }
                });
            },

            /**
             * 设置默认按钮焦点
             * @private
             */
            _setDefaultButtonFocus: function (defaultButton) {
                setTimeout(() => {
                    if (defaultButton) {
                        const $btn = this.element.find(`.win-message-box-button[data-result="${defaultButton}"]`);
                        if ($btn.length) {
                            $btn.focus();
                        }
                    } else {
                        const $primaryBtn = this.element.find('.win-message-box-button.primary');
                        if ($primaryBtn.length) {
                            $primaryBtn.focus();
                        } else {
                            this.element.find('.win-message-box-button').first().focus();
                        }
                    }
                }, 120);
            },

            /**
             * 转义HTML特殊字符
             * @private
             */
            _escapeHtml: function (text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            },

            /**
             * 格式化消息
             * @private
             */
            _formatMessage: function (message) {
                return message.replace(/\n/g, '<br>');
            }
        };

        return messageBox;
    },

    /**
     * 获取图标路径
     * @private
     */
    _getIconPath: function (iconType) {
        const iconMap = {
            [this.icons.info]: 'StaticResources/Icons/info.png',
            [this.icons.warning]: 'StaticResources/Icons/warning.png',
            [this.icons.error]: 'StaticResources/Icons/error.ico',
            [this.icons.question]: 'StaticResources/Icons/question.png',
            [this.icons.success]: 'StaticResources/Icons/success.png'
        };
        return iconMap[iconType] || 'StaticResources/Icons/dialog.png';
    },

    /**
     * 快捷方法 - 显示信息框
     */
    info: function (message, title = '信息', callback = null, parentWindow = null) {
        return this.show({
            title: title,
            message: message,
            icon: this.icons.info,
            type: this.types.OK,
            callback: callback,
            parentWindow: parentWindow
        });
    },

    /**
     * 快捷方法 - 显示警告框
     */
    warning: function (message, title = '警告', callback = null, parentWindow = null) {
        return this.show({
            title: title,
            message: message,
            icon: this.icons.warning,
            type: this.types.OK,
            callback: callback,
            parentWindow: parentWindow
        });
    },

    /**
     * 快捷方法 - 显示错误框
     */
    error: function (message, title = '错误', callback = null, parentWindow = null) {
        return this.show({
            title: title,
            message: message,
            icon: this.icons.error,
            type: this.types.OK,
            callback: callback,
            parentWindow: parentWindow
        });
    },

    /**
     * 快捷方法 - 显示成功框
     */
    success: function (message, title = '成功', callback = null, parentWindow = null) {
        return this.show({
            title: title,
            message: message,
            icon: this.icons.success,
            type: this.types.OK,
            callback: callback,
            parentWindow: parentWindow
        });
    },

    /**
     * 快捷方法 - 显示询问框
     */
    confirm: function (message, title = '确认', callback = null, parentWindow = null) {
        return this.show({
            title: title,
            message: message,
            icon: this.icons.question,
            type: this.types.YES_NO,
            callback: callback,
            parentWindow: parentWindow
        });
    },

    /**
     * 快捷方法 - 显示确认取消框
     */
    confirmCancel: function (message, title = '确认', callback = null, parentWindow = null) {
        return this.show({
            title: title,
            message: message,
            icon: this.icons.question,
            type: this.types.OK_CANCEL,
            callback: callback,
            parentWindow: parentWindow
        });
    },

    /**
     * 关闭所有消息框
     */
    closeAll: function () {
        this.activeMessageBoxes.forEach(box => {
            this._removeFromTaskbar(box.id);
            box.close();
        });
        this.activeMessageBoxes = [];
    }
};

// 添加字体对话框样式
const fontDialogStyles = `
    .font-dialog {
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }

    .font-dialog-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }

    .font-dialog-label {
        width: 60px;
        text-align: right;
        line-height: 28px;
        font-size: 14px;
    }

    .font-dialog-field {
        flex: 1;
    }

    .font-family-select,
    .font-style-select,
    .font-size-select {
        width: 100%;
        border: 1px solid #ccc;
        border-radius: 3px;
        padding: 2px;
    }

    .font-family-select {
        height: 150px;
    }

    .font-style-select,
    .font-size-select {
        height: 100px;
    }

    .font-family-select option,
    .font-style-select option,
    .font-size-select option {
        padding: 4px 8px;
    }

    .font-family-select option:hover,
    .font-style-select option:hover,
    .font-size-select option:hover {
        background-color: #e5f1fb;
    }

    .font-family-select option:checked,
    .font-style-select option:checked,
    .font-size-select option:checked {
        background-color: #cce4f7;
    }

    .font-dialog-preview {
        margin-top: 10px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 3px;
        background-color: #f9f9f9;
    }

    .font-preview-box {
        margin-top: 8px;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 3px;
        background-color: white;
        font-size: 24px;
        min-height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .win-message-box-content.custom-content {
        padding: 0;
        overflow: auto;
        max-height: calc(100% - 120px);
    }
`;

// 将样式添加到页面
$('<style>')
    .prop('type', 'text/css')
    .html(fontDialogStyles)
    .appendTo('head');

export { MessageBoxManager };