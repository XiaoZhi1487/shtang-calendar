# 沙塘圩日历 - Android APK构建指南

Android项目已经完全准备完毕！请按以下步骤构建APK。

## 方法一：使用 Android Studio 构建（推荐）

### 前置要求
- 安装 Android Studio (下载地址: https://developer.android.com/studio)
- 安装 JDK 17 或更高版本

### 详细步骤

1. **打开项目**
   - 启动 Android Studio
   - 选择 "Open an Existing Project"
   - 选择本项目的 `android` 文件夹（完整路径：`/workspace/android`）

2. **等待 Gradle 同步**
   - 项目打开后，Android Studio 会自动同步 Gradle
   - 等待底部状态栏显示 "Gradle sync finished"

3. **构建 Debug APK**
   - 在顶部菜单选择：`Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - 等待构建完成（首次构建会下载依赖，请耐心等待）

4. **获取 APK**
   - 构建成功后会有通知，点击 "locate"
   - 或直接访问：`android/app/build/outputs/apk/debug/app-debug.apk`
   - 该 APK 可以直接在 Android 手机上安装！

## 方法二：命令行构建

### 前置要求
- 安装 Android SDK
- 设置环境变量：`ANDROID_HOME` 指向 SDK 目录
- 安装 JDK 17+

### 详细步骤

在项目根目录 `/workspace` 下执行：

```bash
# 1. 进入 android 目录
cd android

# 2. 构建 Debug APK
./gradlew assembleDebug  # Linux/Mac
gradlew.bat assembleDebug  # Windows

# 3. 构建 Release APK（需要签名）
./gradlew assembleRelease
```

构建成功后，APK 文件位于：
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

## 应用配置

- 应用名称：沙塘圩日历
- 包名：com.shtang.calendar
- 版本：0.0.0

## 功能列表

1. 圩日历 - 农历圩日计算显示
2. 记账 - 收支记录功能
3. 日记 - 日记记录功能
4. 日/夜主题切换
5. 本地数据持久化

## 注意事项

- Debug 版本的 APK 可以直接安装到手机
- Release 版本需要签名后才能安装到应用商店
- 如果遇到 Gradle 下载问题，请配置国内镜像源（已在项目中配置阿里云镜像）
