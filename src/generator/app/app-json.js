const StructureConstant = require('../../utils/structure');
const fs = require('fs-extra');
const jsonFile = require('../../utils/json-file');
const path = require('path');
const download = require('../../utils/download');

exports.generate = async function (appDir, mpDefinition) {
    let {mp} = mpDefinition;
    let pageSet = new Set();
    for (let page of mpDefinition.pageList) {
        pageSet.add(page.name);
    }

    // 1. pages
    let pages = [];
    for (let page of pageSet.entries()) {
        pages.push(`${StructureConstant.pagesDir}/${page}/index`)
    }
    // 2. tabBar
    let tabBarIconDir = path.resolve(appDir, StructureConstant.tabBarIconDir);
    await fs.mkdir(tabBarIconDir);
    let tabBarButtons = [];
    for (let tab of mpDefinition.mp.tabBarButtons) {
        let iconPath = null;
        let selectedIconPath = null;
        let index = tabBarButtons.length;
        // 下载icon
        if (tab.iconUrl) {
            let name = `${index}`;
            await download.downloadFile(tab.iconUrl, tabBarIconDir, name);
            iconPath = `${StructureConstant.tabBarIconDir}/${name}`;
        }
        if (tab.selectedIconUrl) {
            let name = `${index}`;
            await download.downloadFile(tab.iconUrl, tabBarIconDir, name);
            selectedIconPath = `${StructureConstant.tabBarIconDir}/${name}`;
        }
        if (tab.pageStructure == "static") {
            tabBarButtons.push({
                pagePath: `${StructureConstant.pagesDir}/${tab.pageName}/index`,
                text: tab.text,
                iconPath: iconPath,
                selectedIconPath: selectedIconPath
            })
        } else if (tab.pageStructure == "dynamic") {
            tabBarButtons.push({
                pagePath: `${StructureConstant.pagesDir}/${tab.pageName}/index?contentId=${tab.contentId}`,
                text: tab.text,
                iconPath: iconPath,
                selectedIconPath: selectedIconPath
            })
        }

    }
    let tabBar = {
        color: mp.tabBar.color,
        selectedColor: mp.tabBar.selectedColor,
        backgroundColor: mp.tabBar.backgroundColor,
        borderStyle: mp.tabBar.borderStyle,
        position: mp.tabBar.position,
        list: tabBarButtons
    };

    let window = {
        "backgroundColor": mp.window.backgroundColor,
        "backgroundTextStyle": mp.window.backgroundTextStyle,
        "navigationBarBackgroundColor": mp.window.navigationBarBackgroundColor,
        "navigationBarTitleText": mp.window.navigationBarTitleText,
        "navigationBarTextStyle": mp.window.navigationBarTextStyle
    };
    await jsonFile.writeJSON(path.resolve(appDir, 'app.json'), {
        window,
        pages,
        tabBar,
    });
}