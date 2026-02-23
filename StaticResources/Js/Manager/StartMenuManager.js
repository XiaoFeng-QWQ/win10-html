"use strict";

import { MessageBoxManager } from "./MessageBoxManager.js";

/**
 * 开始菜单管理器组件
 */
const StartMenuManager = {
    // 初始化开始菜单
    init: function () {
        this.setupEventListeners();
        this.initAppList();
        this.initTiles();
    },

    // 设置事件监听器
    setupEventListeners: function () {
        // 开始菜单切换
        $('#windows').click((e) => {
            e.stopPropagation();
            $('#win-start-menu').toggleClass('active');
        });

        // 点击其他地方关闭开始菜单
        $(document).click(() => {
            $('#win-start-menu').removeClass('active');
        });

        // 阻止开始菜单内部的点击事件冒泡
        $('#win-start-menu').click((e) => {
            e.stopPropagation();
        });

        // 导航项点击事件
        $('.win-nav-item').click(function () {
            const text = $(this).find('.win-nav-item-text').text();
            MessageBoxManager.info(text, '功能尚未实现')
        });
    },

    // 初始化应用列表
    initAppList: function () {
        // 模拟应用列表数据
        const apps = [
            { name: "Microsoft Edge", icon: "StaticResources/Icons/icons8-ms-边缘-新.svg" },
            { name: "Microsoft Store", icon: "StaticResources/Icons/icons8-microsoft-store-96.png" },
        ];

        // 渲染应用列表
        const $appList = $('.win-app-list');
        apps.forEach(app => {
            $appList.append(`
                <div class="win-app-item">
                    <img src="${app.icon}" alt="${app.name}">
                    <p>${app.name}</p>
                </div>
            `);
        });

        // 应用项点击事件
        $('.win-app-item').click(function () {
            const appName = $(this).find('p').text();
            alert(`启动应用: ${appName}`);
        });
    },

    // 初始化磁贴
    initTiles: function () {
        // 模拟磁贴数据
        const tiles = [
            { name: "Microsoft Edge", icon: "StaticResources/Icons/icons8-ms-边缘-新.svg", size: "wide" },
            { name: "Microsoft Store", icon: "StaticResources/Icons/icons8-microsoft-store-96.png", size: "wide" },
        ];

        // 渲染磁贴
        const $magneticPatch = $('#win-magneticPatch');
        tiles.forEach(tile => {
            $magneticPatch.append(`
                <div class="win-tile ${tile.size}">
                    <img class="win-tile-icon" src="${tile.icon}" alt="${tile.name}">
                    <div class="win-tile-text">${tile.name}</div>
                </div>
            `);
        });
    }
};

export { StartMenuManager }