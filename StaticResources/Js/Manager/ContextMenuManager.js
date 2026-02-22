/**
 * 右键菜单管理器
 */
const ContextMenuManager = {
    // 初始化右键菜单
    init: function () {
        this.setupDocumentContextMenu();
        this.setupDesktopIconContextMenu();
        this.setupMenuCloseHandlers();
    },

    // 设置文档右键菜单
    setupDocumentContextMenu: function () {
        $(document).on('contextmenu', function (e) {
            // 如果点击的是开始菜单或任务栏，则不显示默认右键菜单
            if ($(e.target).closest('#win-start-menu, .win-taskbar').length > 0) {
                return;
            }

            // 如果点击的是桌面图标，则由图标自己的处理程序处理
            if ($(e.target).closest('.desktop-icon').length > 0) {
                return;
            }

            e.preventDefault();
            ContextMenuManager.showBasicContextMenu(e.pageX, e.pageY);
        });
    },

    // 设置桌面图标右键菜单
    setupDesktopIconContextMenu: function () {
        $('body').on('contextmenu', '.desktop-icon', function (e) {
            e.preventDefault();
            e.stopPropagation();
            ContextMenuManager.showDesktopIconContextMenu(e.pageX, e.pageY, $(this));
        });
    },

    // 设置菜单关闭处理程序
    setupMenuCloseHandlers: function () {
        // 点击其他地方关闭所有右键菜单
        $(document).on('click', function () {
            $('.win-context-menu').remove();
        });

        // 阻止菜单内部点击冒泡
        $('body').on('click', '.win-context-menu', function (e) {
            e.stopPropagation();
        });
    },

    // 显示基本右键菜单
    showBasicContextMenu: function (x, y) {
        this.closeAllMenus();

        const menuItems = [
            { text: '刷新', action: () => location.reload() },
            { separator: true },
            { text: '显示设置', action: () => this.openDisplaySettings() },
            { text: '个性化', action: () => this.openPersonalization() }
        ];

        this.createMenu(x, y, menuItems, 'basic-context-menu');
    },

    // 显示桌面图标右键菜单
    showDesktopIconContextMenu: function (x, y, iconElement) {
        this.closeAllMenus();

        // 判断是否多选
        const selectedCount = $('.desktop-icon.selected').length;
        const isMultiSelect = selectedCount > 1;
        const isRecycleBin = iconElement.data('name') === "recycle-bin";

        const menuItems = [];

        if (!isMultiSelect) {
            menuItems.push({
                text: '打开',
                action: () => this.openDesktopIcon(iconElement)
            });
        }

        if (!isMultiSelect && !isRecycleBin) {
            menuItems.push({
                text: '以管理员身份运行',
                action: () => this.runAsAdmin(iconElement)
            });
        }

        menuItems.push({ separator: true });

        if (!isRecycleBin) {
            menuItems.push(
                { text: '剪切', action: () => this.cutItems(iconElement) },
                { text: '复制', action: () => this.copyItems(iconElement) },
                { text: '创建快捷方式', action: () => this.createShortcut(iconElement) }
            );
            menuItems.push({ separator: true });
        }

        if (!isMultiSelect && !isRecycleBin) {
            menuItems.push({
                text: '重命名',
                action: () => this.renameItem(iconElement)
            });
        }

        menuItems.push({
            text: isRecycleBin ? '清空回收站' : '删除',
            action: () => isRecycleBin ? this.emptyRecycleBin() : this.deleteItems(iconElement),
            danger: isRecycleBin
        });

        menuItems.push({ separator: true });

        if (!isMultiSelect) {
            menuItems.push({
                text: '属性',
                action: () => this.showProperties(iconElement)
            });
        }
        this.createMenu(x, y, menuItems, 'desktop-context-menu');
    },

    // 创建菜单
    createMenu: function (x, y, items, menuClass) {
        console.table(items);
        const menu = $('<div class="win-context-menu acrylic-effect"></div>').addClass(menuClass);

        items.forEach(item => {
            if (item.separator) {
                menu.append('<div class="win-context-menu-separator"></div>');
            } else if (item.submenu) {
                const submenuItem = $('<div class="win-context-menu-item has-submenu"></div>')
                    .text(item.text)
                    .append('<span class="submenu-arrow">›</span>');

                // 创建子菜单
                const submenu = $('<div class="win-context-submenu acrylic-effect"></div>');
                item.submenu.forEach(subItem => {
                    const submenuItemElement = $('<div class="win-context-menu-item"></div>')
                        .text(subItem.text || subItem)
                        .toggleClass('disabled', !!subItem.disabled);

                    if (!subItem.disabled && subItem.action) {
                        submenuItemElement.click(function (e) {
                            e.stopPropagation();
                            subItem.action();
                            menu.remove();
                        });
                    }

                    submenu.append(submenuItemElement);
                });

                submenuItem.append(submenu);
                menu.append(submenuItem);

                // 子菜单显示/隐藏逻辑
                submenuItem.hover(
                    function () {
                        submenu.show().position({
                            my: "left top",
                            at: "right top",
                            of: submenuItem,
                            collision: "flipfit"
                        });
                    },
                    function () {
                        // 添加延迟防止鼠标移动到子菜单时立即关闭
                        setTimeout(() => {
                            if (!submenu.is(':hover')) {
                                submenu.hide();
                            }
                        }, 200);
                    }
                );

                // 子菜单自己的悬停处理
                submenu.hover(
                    function () { /* 保持打开状态 */ },
                    function () {
                        submenu.hide();
                    }
                );
            } else {
                const menuItem = $('<div class="win-context-menu-item"></div>')
                    .text(item.text)
                    .toggleClass('disabled', !!item.disabled)
                    .toggleClass('danger', !!item.danger);

                if (!item.disabled && item.action) {
                    menuItem.click(function (e) {
                        e.stopPropagation();
                        item.action();
                        menu.remove();
                    });
                }

                menu.append(menuItem);
            }
        });

        $('body').append(menu);
        this.positionMenu(menu, x, y);

        // 添加淡入动画效果
        menu.hide().fadeIn(150);
    },

    // 定位菜单 - 已添加自动调整功能
    positionMenu: function (menu, x, y) {
        const menuWidth = menu.outerWidth();
        const menuHeight = menu.outerHeight();
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();

        // 计算初始位置
        let finalX = x;
        let finalY = y;

        // 水平方向调整 - 如果右侧超出则向左移动
        if (x + menuWidth > windowWidth) {
            finalX = windowWidth - menuWidth - 10; // 留出边距
        }

        // 垂直方向调整 - 如果底部超出则向上移动
        if (y + menuHeight > windowHeight) {
            finalY = windowHeight - menuHeight - 10; // 留出边距
        }

        // 确保不会超出视口顶部和左侧
        finalX = Math.max(10, finalX);
        finalY = Math.max(10, finalY);

        // 应用位置
        menu.css({
            'left': finalX + 'px',
            'top': finalY + 'px',
            'display': 'block'
        });
    },

    // 关闭所有右键菜单
    closeAllMenus: function () {
        $('.win-context-menu').fadeOut(100, function () {
            $(this).remove();
        });
    },

    // 处理查看选项
    handleViewOptions: function () {
        // 这里可以添加实际的查看选项逻辑
        alert('查看选项');
    },

    // 排序图标
    sortIcons: function (method) {
        // 实际排序逻辑
        alert(`按${method}排序`);
    },

    // 创建新项目
    createNewItem: function (type) {
        alert(`创建新${type}`);
    },

    // 打开显示设置
    openDisplaySettings: function () {
        alert('打开显示设置');
    },

    // 打开个性化设置
    openPersonalization: function () {
        alert('打开个性化设置');
    },

    // 打开桌面图标
    openDesktopIcon: function (iconElement) {
        WindowManager.openApp(iconElement);
    },

    // 以管理员身份运行
    runAsAdmin: function (iconElement) {
        const iconName = iconElement.find('span').text();
        alert(`以管理员身份运行: ${iconName}`);
    },

    // 剪切项目
    cutItems: function (iconElement) {
        const iconName = iconElement.find('span').text();
        alert(`剪切: ${iconName}`);
    },

    // 复制项目
    copyItems: function (iconElement) {
        const iconName = iconElement.find('span').text();
        alert(`复制: ${iconName}`);
    },

    // 创建快捷方式
    createShortcut: function (iconElement) {
        const iconName = iconElement.find('span').text();
        alert(`创建快捷方式: ${iconName}`);
    },

    // 重命名项目
    renameItem: function (iconElement) {
        const iconName = iconElement.find('span').text();
        alert(`重命名: ${iconName}`);
    },

    // 删除项目
    deleteItems: function (iconElement) {
        const iconName = iconElement.find('span').text();
        alert(`删除: ${iconName}`);
    },

    // 清空回收站
    emptyRecycleBin: function () {
        alert('清空回收站');
    },

    // 显示属性
    showProperties: function (iconElement) {
        const iconName = iconElement.find('span').text();
        alert(`${iconName} 属性`);
    }
};
ContextMenuManager.init();