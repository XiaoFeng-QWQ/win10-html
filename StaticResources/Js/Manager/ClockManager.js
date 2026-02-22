/**
 * 时钟管理器组件
 */
const ClockManager = {
    // 初始化时钟
    init: function () {
        this.createClockPanel();
        this.initCalendar();
        this.updateClock();
        this.setupEventListeners();

        // 每秒更新一次时间
        setInterval(this.updateClock.bind(this), 1000);
        // 每秒更新一次日历顶部时间
        setInterval(this.updateCalendarTime.bind(this), 1000);
    },

    // 创建时钟面板
    createClockPanel: function () {
        this.clockPanel = $(`
            <div class="win-clock-panel acrylic-effect">
                <div class="win-calendar">
                    <div class="win-calendar-time">
                        <div class="win-calendar-time-main">
                            <span class="win-calendar-hours">00</span>:<span class="win-calendar-minutes">00</span>:<span class="win-calendar-seconds">00</span>
                        </div>
                    </div>
                    <div class="win-calendar-date-row" id="calendarDateRow">
                        <span class="win-calendar-gregorian" id="calendarFullDate">0000年00月00日</span>
                        <span class="win-calendar-lunar" id="calendarLunar"></span>
                    </div>
                    <hr>
                    <div class="win-calendar-header">
                        <div class="win-calendar-title" id="calendarTitle">0000年1月</div>
                        <div class="win-calendar-nav">
                            <button id="calendarPrev">&lt;</button>
                            <button id="calendarToday"> </button>
                            <button id="calendarNext">&gt;</button>
                        </div>
                    </div>
                    <div class="win-calendar-weekdays">
                        <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
                    </div>
                    <div class="win-calendar-days" id="calendarDays"></div>
                </div>
            </div>
        `);
        $('body').append(this.clockPanel);

        // 添加日期行点击事件
        $('#calendarDateRow').click(() => {
            this.goToToday();
        });

        // 初始化日期行
        this.updateCalendarDateRow(new Date());
    },

    // 初始化日历
    initCalendar: function () {
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.renderCalendar(this.currentYear, this.currentMonth);
    },

    // 设置事件监听器
    setupEventListeners: function () {
        // 点击时钟显示/隐藏日历面板
        $('#win-clock').click((e) => {
            e.stopPropagation();
            this.clockPanel.toggleClass('active');
        });

        // 点击其他地方隐藏日历面板
        $(document).click(() => {
            this.clockPanel.removeClass('active');
        });

        // 阻止日历面板内部的点击事件冒泡
        this.clockPanel.click((e) => {
            e.stopPropagation();
        });

        // 日历导航事件
        $('#calendarPrev').click(() => {
            this.animateCalendarTransition('prev', () => {
                this.currentMonth--;
                if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                }
                this.renderCalendar(this.currentYear, this.currentMonth);
            });
        });

        $('#calendarNext').click(() => {
            this.animateCalendarTransition('next', () => {
                this.currentMonth++;
                if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                }
                this.renderCalendar(this.currentYear, this.currentMonth);
            });
        });

        $('#calendarToday').click(() => {
            this.goToToday();
        });
    },

    // 日历切换动画（更快的版本）
    animateCalendarTransition: function (direction, callback) {
        const calendarDays = $('#calendarDays');
        const animationClass = direction === 'next' ? 'slide-out-up' : 'slide-out-down';

        // 添加离开动画
        calendarDays.removeClass('slide-in').addClass(animationClass);

        // 动画完成后执行回调并添加入场动画
        setTimeout(() => {
            callback();

            // 设置入场初始状态（与离开方向相反）
            const enterClass = direction === 'next' ? 'slide-out-down' : 'slide-out-up';
            calendarDays.removeClass(animationClass).addClass(enterClass);

            // 强制重排以确保动画生效
            calendarDays[0].offsetHeight;

            // 添加入场动画
            setTimeout(() => {
                calendarDays.removeClass(enterClass).addClass('slide-in');
            }, 20); // 减少延迟到20ms
        }, 200); // 减少动画时间到200ms
    },

    // 更新时间显示
    updateClock: function () {
        const now = new Date();

        // 格式化时间
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;

        // 格式化日期
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const dateString = `${year}/${month}/${day}`;

        // 更新显示
        $('.win-time').text(timeString);
        $('.win-date').text(dateString);
    },

    // 更新日历顶部时间
    updateCalendarTime: function () {
        const now = new Date();

        // 更新时分秒
        $('.win-calendar-hours').text(now.getHours().toString().padStart(2, '0'));
        $('.win-calendar-minutes').text(now.getMinutes().toString().padStart(2, '0'));
        $('.win-calendar-seconds').text(now.getSeconds().toString().padStart(2, '0'));

        // 更新日期行（只在日期变化时更新）
        if (!this.lastUpdateTime || this.lastUpdateTime.getDate() !== now.getDate()) {
            this.updateCalendarDateRow(now);
            this.lastUpdateTime = now;
        }
    },

    // 更新日历日期行
    updateCalendarDateRow: function (date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        // 更新公历日期
        $('#calendarFullDate').text(`${year}年${month}月${day}日`);

        // 清空农历日期显示
        $('#calendarLunar').text('');
    },

    // 跳转到今天
    goToToday: function () {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // 如果已经是当前月份，则不执行动画
        if (this.currentYear === currentYear && this.currentMonth === currentMonth) {
            return;
        }

        // 确定动画方向
        const direction = this.currentMonth < currentMonth ? 'next' : 'prev';

        this.animateCalendarTransition(direction, () => {
            this.currentYear = currentYear;
            this.currentMonth = currentMonth;
            this.renderCalendar(this.currentYear, this.currentMonth);
            this.updateCalendarDateRow(now);
        });
    },

    // 渲染日历
    renderCalendar: function (year, month) {
        $('#calendarTitle').text(`${year}年${month + 1}月`);

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const today = new Date();
        const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

        let calendarHtml = '';

        // 上个月的日期
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = 0; i < startingDay; i++) {
            calendarHtml += `<div class="win-calendar-day other-month">${prevMonthLastDay - startingDay + i + 1}</div>`;
        }

        // 当前月的日期
        for (let i = 1; i <= daysInMonth; i++) {
            const isToday = isCurrentMonth && i === today.getDate();
            calendarHtml += `<div class="win-calendar-day ${isToday ? 'today' : ''}">${i}</div>`;
        }

        // 下个月的日期
        const totalCells = startingDay + daysInMonth;
        const remainingCells = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            calendarHtml += `<div class="win-calendar-day other-month">${i}</div>`;
        }

        $('#calendarDays').html(calendarHtml);

        // 确保动画类正确设置
        setTimeout(() => {
            $('#calendarDays').addClass('slide-in');
        }, 20); // 减少延迟到20ms

        // 添加日期点击事件
        $('.win-calendar-day:not(.other-month)').click(function () {
            // 移除之前选中的active类
            $('.win-calendar-day').removeClass('active');

            // 给当前点击的日期添加active类
            $(this).addClass('active');

            const day = parseInt($(this).text());
            console.log(`选择了 ${year}年${month + 1}月${day}日`);
        });
    }
};

// 初始化时钟管理器
ClockManager.init();