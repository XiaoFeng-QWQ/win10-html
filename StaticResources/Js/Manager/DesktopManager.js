/**
 * 桌面管理器
 */
const DesktopManager = {
    // 初始化桌面
    init: function () {
        this.initDesktopIcons();
        this.loadIconPositions();
        this.setupEventListeners();
    },

    // 初始化桌面图标
    initDesktopIcons: function () {
        // 网格设置
        this.grid = {
            cellWidth: 80,
            cellHeight: 100,
            gap: 20,
            padding: 20
        };

        // 响应式调整网格大小
        if (window.innerWidth < 768) {
            this.grid.cellWidth = 72;
            this.grid.cellHeight = 90;
            this.grid.gap = 16;
            this.grid.padding = 16;
        }

        // 创建网格辅助线
        this.verticalGuide = $('<div class="grid-guide vertical"></div>');
        this.horizontalGuide = $('<div class="grid-guide horizontal"></div>');
        $('body').append(this.verticalGuide, this.horizontalGuide);

        // 选择框和拖动状态
        this.selectionBox = $('#selectionBox');
        this.selectionStart = { x: 0, y: 0 };
        this.isSelecting = false;
        this.wasDragging = false;
        this.isDraggingIcon = false;
        this.draggedIcons = [];
        this.dragStart = null;

        // 设置图标双击事件
        $('.desktop-icon').on('dblclick', function () {
            WindowManager.openApp($(this));
        });
    },

    // 设置事件监听器
    setupEventListeners: function () {
        // 桌面空白处鼠标按下 - 开始选择
        $('#content').on('mousedown', this.handleDesktopMouseDown.bind(this));

        // 鼠标移动 - 更新选择框或拖动图标
        $(document).on('mousemove', this.handleMouseMove.bind(this));

        // 鼠标释放 - 结束选择或拖动
        $(document).on('mouseup', this.handleMouseUp.bind(this));

        // 图标鼠标按下 - 开始拖动
        $('.desktop-icon').on('mousedown', this.handleIconMouseDown.bind(this));

        $('.hover-img').hover(
            function () {
                var $this = $(this);
                var currentSrc = $this.attr('src');
                var hoverSrc = currentSrc.replace(/(\.[^/.]+)$/, '_hover$1');
                if (!$this.data('original')) {
                    $this.data('original', currentSrc);
                }
                $this.attr('src', hoverSrc);
            },
            function () {
                var $this = $(this);
                var originalSrc = $this.data('original');

                if (originalSrc) {
                    $this.attr('src', originalSrc);
                }
            }
        );
    },

    handleDesktopMouseDown: function (e) {
        // 确保点击的是桌面空白区域
        if ($(e.target).closest('.desktop-icon, #selectionBox').length > 0 || e.button !== 0) return;

        this.isSelecting = true;
        this.wasDragging = false;
        this.selectionStart = {
            x: e.pageX,
            y: e.pageY
        };

        // 初始化选择框
        this.selectionBox.css({
            left: this.selectionStart.x + 'px',
            top: this.selectionStart.y + 'px',
            width: '0px',
            height: '0px',
        }).addClass('visible');

        // 清除之前的选择（除非按住Ctrl）
        if (!e.ctrlKey) {
            $('.desktop-icon').removeClass('selected');
        }
    },

    handleMouseMove: function (e) {
        // 处理选择框拖动
        if (this.isSelecting) {
            const startX = this.selectionStart.x;
            const startY = this.selectionStart.y;
            const currentX = e.pageX;
            const currentY = e.pageY;

            const left = Math.min(startX, currentX);
            const top = Math.min(startY, currentY);
            const width = Math.abs(currentX - startX);
            const height = Math.abs(currentY - startY);

            this.selectionBox.css({
                left: left + 'px',
                top: top + 'px',
                width: width + 'px',
                height: height + 'px'
            });

            this.checkIconSelection(left, top, width, height, e.ctrlKey);
            this.wasDragging = width > 2 || height > 2;
        }

        // 处理图标拖动
        else if (this.isDraggingIcon && this.dragStart) {
            const deltaX = e.clientX - this.dragStart.x;
            const deltaY = e.clientY - this.dragStart.y;

            this.dragStart.icons.forEach(icon => {
                icon.element.css({
                    'transform': `translate(${deltaX}px, ${deltaY}px)`,
                    'transition': 'none'
                });
            });

            // 更新网格辅助线
            this.updateGridGuides(this.dragStart.icons[0].element);
        }
    },

    // 检测图标选择
    checkIconSelection: function (left, top, width, height, ctrlKey) {
        const selectionRect = {
            left: left,
            right: left + width,
            top: top,
            bottom: top + height
        };

        $('.desktop-icon').each(function () {
            const $icon = $(this);
            const iconRect = $icon[0].getBoundingClientRect();

            const isIntersecting = !(
                selectionRect.right < iconRect.left ||
                selectionRect.left > iconRect.right ||
                selectionRect.bottom < iconRect.top ||
                selectionRect.top > iconRect.bottom
            );

            if (isIntersecting) {
                $icon.addClass('selected');
            } else if (!ctrlKey) {
                $icon.removeClass('selected');
            }
        });
    },

    // 处理鼠标释放事件
    handleMouseUp: function (e) {
        // 处理选择结束
        if (this.isSelecting) {
            this.isSelecting = false;
            this.selectionBox.removeClass('visible').css({
                width: '0',
                height: '0',
                left: '0',
                top: '0',
            });

            if (!this.wasDragging && !e.ctrlKey) {
                $('.desktop-icon').removeClass('selected');
            }
        }

        // 处理图标拖动结束
        if (this.isDraggingIcon && this.dragStart) {
            const deltaX = e.clientX - this.dragStart.x;
            const deltaY = e.clientY - this.dragStart.y;

            this.dragStart.icons.forEach(icon => {
                const $icon = icon.element;
                const finalLeft = icon.startLeft + deltaX;
                const finalTop = icon.startTop + deltaY;

                $icon.css({
                    'left': finalLeft + 'px',
                    'top': finalTop + 'px',
                    'transform': 'none',
                    'opacity': '1'
                }).data({
                    'original-left': finalLeft,
                    'original-top': finalTop
                }).removeClass('dragging');
            });

            // 对齐到网格
            this.draggedIcons.each((_, el) => {
                this.alignToGrid($(el));
            });

            this.saveIconPositions();

            this.isDraggingIcon = false;
            this.draggedIcons = [];
            this.dragStart = null;
            this.verticalGuide.hide();
            this.horizontalGuide.hide();
        }
    },

    // 处理图标鼠标按下事件
    handleIconMouseDown: function (e) {
        if (e.button !== 0) return;
        e.stopPropagation();

        const $target = $(e.currentTarget);
        const isCtrlSelection = e.ctrlKey || e.metaKey;

        if (!isCtrlSelection && !$target.hasClass('selected')) {
            $('.desktop-icon').removeClass('selected');
        }

        $target.toggleClass('selected', !(isCtrlSelection && $target.hasClass('selected')));

        this.isDraggingIcon = true;
        this.draggedIcons = $('.desktop-icon.selected');

        this.dragStart = {
            x: e.clientX,
            y: e.clientY,
            icons: this.draggedIcons.map((_, el) => {
                const rect = el.getBoundingClientRect();
                return {
                    element: $(el),
                    startLeft: rect.left,
                    startTop: rect.top
                };
            }).get()
        };

        this.draggedIcons.addClass('dragging');
        this.verticalGuide.show();
        this.horizontalGuide.show();
    },

    // 对齐图标到网格
    alignToGrid: function (icon) {
        const pos = icon.position();

        const gridX = Math.round((pos.left - this.grid.padding) / (this.grid.cellWidth + this.grid.gap)) * (this.grid.cellWidth + this.grid.gap) + this.grid.padding;
        const gridY = Math.round((pos.top - this.grid.padding) / (this.grid.cellHeight + this.grid.gap)) * (this.grid.cellHeight + this.grid.gap) + this.grid.padding;

        icon.css({
            'left': gridX + 'px',
            'top': gridY + 'px'
        });
    },

    // 更新网格辅助线位置
    updateGridGuides: function (icon) {
        const pos = icon.position();
        const gridX = Math.round((pos.left - this.grid.padding) / (this.grid.cellWidth + this.grid.gap)) * (this.grid.cellWidth + this.grid.gap) + this.grid.padding;
        const gridY = Math.round((pos.top - this.grid.padding) / (this.grid.cellHeight + this.grid.gap)) * (this.grid.cellHeight + this.grid.gap) + this.grid.padding;

        this.verticalGuide.css({
            'left': gridX + 'px',
            'top': 0,
            'height': $(window).height()
        });

        this.horizontalGuide.css({
            'top': gridY + 'px',
            'left': 0,
            'width': $(window).width()
        });
    },

    // 保存图标位置到localStorage
    saveIconPositions: function () {
        const positions = {};

        $('.desktop-icon').each(function () {
            const iconName = $(this).data('name');
            positions[iconName] = {
                left: parseInt($(this).css('left')) || 0,
                top: parseInt($(this).css('top')) || 0
            };
        });

        localStorage.setItem('desktopIconPositions', JSON.stringify(positions));
    },

    // 从localStorage加载图标位置
    loadIconPositions: function () {
        try {
            const saved = localStorage.getItem('desktopIconPositions');
            if (!saved) {
                this.resetIconPositions();
                return;
            }

            const positions = JSON.parse(saved);

            $('.desktop-icon').each(function () {
                const iconName = $(this).data('name');
                if (positions[iconName]) {
                    $(this).css({
                        'left': positions[iconName].left + 'px',
                        'top': positions[iconName].top + 'px'
                    }).data({
                        'original-left': positions[iconName].left,
                        'original-top': positions[iconName].top
                    });
                }
            });
        } catch (e) {
            console.warn("桌面图标加载失败，使用默认布局" + e)
            const defaultPositions = {
                'this-pc': { left: 20, top: 20 },
                'control-panel': { left: 120, top: 20 },
                'recycle-bin': { left: 20, top: 140 },
                'edge': { left: 120, top: 140 },
                'notepad': { left: 20, top: 280 }
            };

            if (window.innerWidth < 768) {
                defaultPositions['this-pc'] = { left: 16, top: 16 };
                defaultPositions['control-panel'] = { left: 104, top: 16 };
                defaultPositions['recycle-bin'] = { left: 16, top: 122 };
                defaultPositions['edge'] = { left: 104, top: 122 };
            }

            $('.desktop-icon').each(function () {
                const iconName = $(this).data('name');
                if (defaultPositions[iconName]) {
                    $(this).css({
                        'left': defaultPositions[iconName].left + 'px',
                        'top': defaultPositions[iconName].top + 'px'
                    }).data({
                        'original-left': defaultPositions[iconName].left,
                        'original-top': defaultPositions[iconName].top
                    });
                }
            });

            this.saveIconPositions();
        }
    },
};

// 初始化桌面
$(document).ready(function () {
    DesktopManager.init();
});