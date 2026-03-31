<template>
    <section class="main-section">
        <el-card class="main-card">
            <div class="data-section">
                <div class="stats-data-box">
                    <el-card class="total-stats-card">
                        <div class="stats-data-box">
                            <p><span class="primary">實到 </span>/ 總人數</p>
                            <el-progress class="progress" type="circle" :percentage="percentage" />
                            <div class="total-stats-data-card-box">
                                <el-card class="total-stats-card-item">
                                    <h3>應到人數</h3>
                                    <p>{{ stats.totalShouldAttend }}</p>
                                </el-card>
                                <el-card class="total-stats-card-item">
                                    <h3>實到人數</h3>
                                    <p>{{ stats.totalCheckedIn }}</p>
                                </el-card>
                                <el-card class="total-stats-card-item">
                                    <h3>缺席人數</h3>
                                    <p>{{ stats.totalNotArrived }}</p>
                                </el-card>
                            </div>
                        </div>
                    </el-card>

                    <el-card class="site-stats-card">
                        <div class="site-stats-data-card-box">
                            <el-card class="site-stats-card-item success">
                                <h3>現場人數</h3>
                                <p>{{ stats.totalOnSite }}</p>
                            </el-card>
                            <el-card class="site-stats-card-item danger">
                                <h3>已離開人數</h3>
                                <p>{{ stats.totalLeft }}</p>
                            </el-card>
                        </div>
                    </el-card>
                </div>

                <div class="checkin-table-box">
                    <h1>掃碼槍簽到退系統</h1>

                    <div class="function-bar">
                        <el-form-item label="" label-position="left">
                            <el-input v-model="queryText" placeholder="搜尋參與者資料" @input="handleInput" />
                        </el-form-item>
                        <el-button class="site-on" link type="primary" @click="openDialog">+現場登記</el-button>
                        <el-button class="printer-config-btn" link type="info" @click="openPrinterConfig">
                            <el-icon>
                                <Setting />
                            </el-icon>
                            印表機設定
                        </el-button>
                    </div>

                    <div class="barcode-gun-status">
                        <div class="status-indicator" :class="{ active: isScanning }">
                            <el-icon>
                                <Promotion />
                            </el-icon>
                            <span>{{ isScanning ? '正在監聽掃碼槍...' : '掃碼槍待機中' }}</span>
                        </div>


                        <div class="action-mode">
                            <el-button :class="checkActive === 'checkin' ? 'active' : ''" class="checkin-btn"
                                @click="switchCheckBtn('checkin')">
                                簽到模式
                            </el-button>
                            <el-button :class="checkActive === 'checkout' ? 'active' : ''" class="checkout-btn"
                                @click="switchCheckBtn('checkout')">
                                簽退模式
                            </el-button>
                        </div>
                    </div>

                    <p class="primary">{{ total }} 位參加者</p>
                    <div class="scroll-box">
                        <el-scrollbar ref="scrollRef" @scroll.native="handleScroll">
                            <el-card v-for="item in showAttendeesList" class="checkin-data-card">
                                <div class="member-info" @click="openDrawer(item)">
                                    <p class="attendee-name">{{ item.member.chineseName }}</p>
                                    <p>{{ memberEnums[item.member.category] }}</p>
                                </div>
                                <el-icon class="checkin-icon" :class="item.isCheckedIn ? 'checkin' : ''"
                                    @click="handleClickCheckIcon(item)">
                                    <CircleCheck />
                                </el-icon>
                            </el-card>
                        </el-scrollbar>
                    </div>
                </div>


            </div>

        </el-card>

        <el-dialog class="option-dialog" v-model="isOptionDialogVisible" width="40%">
            <div class="btn-section">
                <el-button @click="checkOut">
                    <div class="content">
                        <div class="img-box">
                            <img src="../../assets/icons/logout.svg" alt="">
                        </div>
                        <p>簽退</p>
                    </div>
                </el-button>
                <el-button @click="handleDeleteLastCheckinRecord">
                    <div class="content">
                        <div class="img-box">
                            <el-icon class="icon">
                                <RefreshLeft />
                            </el-icon>
                        </div>
                        <p>撤回</p>
                    </div>
                </el-button>
            </div>
        </el-dialog>

        <el-dialog v-model="isDialogVisible" width="40%" :before-close="closeDialog">
            <h1>現場登記</h1>
            <el-form class="insert-form" :model="insertFormData" label-position="top" :rules="formRulesTW"
                ref="insertFormRef">
                <el-form-item label="會員姓名" prop="chineseName">
                    <el-input v-model="insertFormData.chineseName" placeholder="請輸入會員姓名" />
                </el-form-item>

                <el-form-item label="會員信箱" prop="email">
                    <el-input v-model="insertFormData.email" placeholder="請輸入會員信箱" />
                </el-form-item>
            </el-form>
            <div class="dialog-footer">
                <el-button @click="closeDialog">取 消</el-button>
                <el-button type="primary" @click="insertAttendees(insertFormRef)">確 定</el-button>
            </div>
        </el-dialog>

        <el-drawer v-model="isDrawerVisible" title="會員資料" :size="'50%'" :before-close="closeDrawer">
            <div class="drawer-content">
                <el-form label-position="left">
                    <el-form-item label="會員編號">
                        <el-text>{{ attendee.sequenceNo }}</el-text>
                    </el-form-item>
                    <el-form-item label="會員姓名">
                        <el-text>{{ attendee.member.chineseName }}</el-text>
                    </el-form-item>
                    <el-form-item label="會員類別">
                        <el-text>{{ memberEnums[attendee.member.category] }}</el-text>
                    </el-form-item>
                    <el-form-item label="身分證號">
                        <el-text>{{ attendee.member.idCard }}</el-text>
                    </el-form-item>
                    <el-form-item label="所屬單位">
                        <el-text>{{ attendee.member.affiliation }}</el-text>
                    </el-form-item>
                    <el-form-item label="會員職稱">
                        <el-text>{{ attendee.member.jobTitle }}</el-text>
                    </el-form-item>
                    <el-form-item label="會員電話">
                        <el-text>{{ attendee.member.phone }}</el-text>
                    </el-form-item>
                    <el-form-item label="會員信箱">
                        <el-text>{{ attendee.member.email }}</el-text>
                    </el-form-item>
                    <el-form-item label="飲食偏好">
                        <el-text>{{ attendee.member.food }}</el-text>
                    </el-form-item>
                </el-form>
            </div>
        </el-drawer>

        <!-- 印表機設定對話框 -->
        <el-dialog v-model="isPrinterConfigVisible" title="印表機設定" width="80%" class="printer-config-dialog">
            <div class="printer-config">
                <el-form label-position="left" label-width="120px">
                    <el-form-item label="連接方式">
                        <el-radio-group v-model="connectionType" @change="handleConnectionTypeChange">
                            <el-radio value="usb">USB</el-radio>
                            <el-radio value="network">網路</el-radio>
                            <el-radio value="driver">驅動</el-radio>
                        </el-radio-group>
                    </el-form-item>

                    <el-form-item v-if="connectionType === 'usb'" label="USB印表機">
                        <el-select v-model="selectedPrinter" placeholder="請選擇印表機">
                            <el-option v-for="printer in usbPrinters" :key="printer.path" :label="printer.name"
                                :value="printer" />
                        </el-select>
                    </el-form-item>

                    <el-form-item v-if="connectionType === 'driver'" label="驅動印表機">
                        <el-select v-model="selectedPrinter" placeholder="請選擇印表機">
                            <el-option v-for="printer in driverPrinters" :key="printer.path" :label="printer.name"
                                :value="printer" />
                        </el-select>
                    </el-form-item>

                    <el-form-item label="連接狀態">
                        <el-tag :type="isConnected ? 'success' : 'danger'">
                            {{ isConnected ? '已連接' : '未連接' }}
                        </el-tag>
                        <span v-if="printerError" class="error-text">{{ printerError }}</span>
                    </el-form-item>

                    <!-- 標籤預覽與位置調整 -->
                    <el-divider content-position="left">標籤預覽與位置調整</el-divider>

                    <div class="preview-section">
                        <div class="preview-canvas-container">
                            <canvas ref="previewCanvas" width="400" height="300" class="preview-canvas"></canvas>
                            <div class="canvas-info">
                                <span>標籤尺寸: {{ labelSettings.width }}mm × {{ labelSettings.height }}mm</span>
                            </div>
                        </div>

                        <div class="position-controls">
                            <h4>位置調整</h4>

                            <el-form-item label="標籤寬度 (mm)">
                                <el-input-number v-model="labelSettings.width" :min="20" :max="200" :step="1"
                                    @change="updatePreview" />
                            </el-form-item>

                            <el-form-item label="標籤高度 (mm)">
                                <el-input-number v-model="labelSettings.height" :min="15" :max="150" :step="1"
                                    @change="updatePreview" />
                            </el-form-item>

                            <el-form-item label="X 軸位置">
                                <el-slider v-model="labelSettings.x" :min="0" :max="labelSettings.width - 10" :step="1"
                                    show-input @input="updatePreview" />
                            </el-form-item>

                            <el-form-item label="Y 軸位置">
                                <el-slider v-model="labelSettings.y" :min="0" :max="labelSettings.height - 5" :step="1"
                                    show-input @input="updatePreview" />
                            </el-form-item>

                            <el-form-item label="字體大小">
                                <el-slider v-model="labelSettings.fontSize" :min="40" :max="200" :step="10" show-input
                                    @input="updatePreview" />
                            </el-form-item>

                            <el-form-item label="預覽文字">
                                <el-input v-model="labelSettings.previewText" placeholder="輸入要預覽的文字"
                                    @input="updatePreview" />
                            </el-form-item>

                            <div class="position-actions">
                                <el-button @click="resetPosition">重置位置</el-button>
                                <el-button @click="centerText">置中文字</el-button>
                            </div>
                        </div>
                    </div>
                </el-form>

                <div class="printer-actions">
                    <el-button @click="initializePrinters" :loading="isPrinterLoading">重新整理印表機</el-button>
                    <el-button type="primary" @click="testPrint" :disabled="!isConnected">測試列印</el-button>
                </div>
            </div>
        </el-dialog>

        <!-- 移除原本的測試組件，改為設定按鈕 -->
        <!-- <TSCPrinterExample></TSCPrinterExample> -->
    </section>
</template>
<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import {
    getAttendeeListByTagAndPaginationApi,
    insertAttendeeOnSiteApi,
} from "@/api/attendee";
import { checkinApi, deleteLastCheckinRecordApi, getCheckDataApi } from "@/api/checkin";
import { useBarcodeGun } from "@/composables/useBarcodeGun";
import { useTSC, type PrintData } from "@/composables/useTSC";
import { ElNotification, ElMessage, FormInstance } from "element-plus";
import TSCPrinterExample from "@/components/TSCPrinterExample.vue";
import {
    Promotion,
    Delete,
    Position,
    Setting,
    Printer,
    RefreshLeft
} from "@element-plus/icons-vue";

import { memberEnums } from "@/enums/MemberEnum";
import { formRulesTW } from "@/utils/checkSum";

import { useAppStore } from "@/store";

// const closeSidebar = () => {
//     const appStore = useAppStore();
//     appStore.closeSideBar();
// };

/**---------------TSC印表機設置----------------- */
const {
    isConnected,
    isLoading: isPrinterLoading,
    error: printerError,
    printLabel,
    selectedPrinter,
    usbPrinters,
    driverPrinters,
    connectionType,
    setConnectionType,
    initializePrinters
} = useTSC()

// 標籤設定和預覽
const previewCanvas = ref<HTMLCanvasElement | null>(null)
const labelSettings = reactive({
    width: 80,      // 標籤寬度 (mm)
    height: 40,     // 標籤高度 (mm)
    x: 40,          // X 軸位置
    y: 20,          // Y 軸位置
    fontSize: 120,  // 字體大小
    previewText: '測試標籤'  // 預覽文字
})

// 更新預覽在面
const updatePreview = () => {
    if (!previewCanvas.value) return

    const canvas = previewCanvas.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清除帆布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 計算縮放比例 (假設 1mm = 4 像素)
    const scale = 4
    const labelWidth = labelSettings.width * scale
    const labelHeight = labelSettings.height * scale

    // 繪製標籤背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(10, 10, labelWidth, labelHeight)
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, labelWidth, labelHeight)

    // 繪製網格線 (每 5mm 一條線)
    ctx.strokeStyle = '#f0f0f0'
    ctx.lineWidth = 1
    for (let i = 0; i <= labelSettings.width; i += 5) {
        const x = 10 + i * scale
        ctx.beginPath()
        ctx.moveTo(x, 10)
        ctx.lineTo(x, 10 + labelHeight)
        ctx.stroke()
    }
    for (let i = 0; i <= labelSettings.height; i += 5) {
        const y = 10 + i * scale
        ctx.beginPath()
        ctx.moveTo(10, y)
        ctx.lineTo(10 + labelWidth, y)
        ctx.stroke()
    }

    // 繪製文字
    const fontSize = Math.max(12, labelSettings.fontSize / 8) // 調整字體大小以適合預覽
    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = '#000000'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'

    const textX = 10 + labelSettings.x * scale
    const textY = 10 + labelSettings.y * scale
    ctx.fillText(labelSettings.previewText, textX, textY)

    // 繪製位置指示器
    ctx.fillStyle = '#ff4d4f'
    ctx.beginPath()
    ctx.arc(textX, textY, 3, 0, 2 * Math.PI)
    ctx.fill()

    // 顯示座標
    ctx.fillStyle = '#666666'
    ctx.font = '10px Arial'
    ctx.fillText(`(${labelSettings.x}, ${labelSettings.y})`, textX + 5, textY - 15)
}

// 重置位置
const resetPosition = () => {
    labelSettings.x = 5
    labelSettings.y = 5
    updatePreview()
}

// 文字置中
const centerText = () => {
    if (!previewCanvas.value) return

    const canvas = previewCanvas.value
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 計算文字置中位置
    const fontSize = labelSettings.fontSize / 8
    ctx.font = `${fontSize}px Arial`
    const textWidth = ctx.measureText(labelSettings.previewText).width / 4 // 轉換為 mm

    labelSettings.x = Math.max(0, (labelSettings.width - textWidth) / 2)
    labelSettings.y = labelSettings.height / 2 - 3 // 簡單的垂直置中

    updatePreview()
}

// 處理連接方式改變 - 包裝函數解決類型問題
const handleConnectionTypeChange = (value: string | number | boolean | undefined) => {
    if (typeof value === 'string') {
        setConnectionType(value as 'usb' | 'network' | 'driver')
    }
}

// 自動打印開關
const isAutoPrintEnabled = ref(true)

// 打印用戶名稱標籤（使用自定義位置）
const printUserNameLabel = async (userName: string) => {
    if (!isAutoPrintEnabled.value || !isConnected.value) {
        console.log('自動打印已關閉或印表機未連接')
        return false
    }

    try {
        const printData: PrintData = {
            text: userName,
            fontSize: labelSettings.fontSize,
            x: labelSettings.x,
            y: labelSettings.y,
            rotation: '0',
            fontStyle: '2', // 粗體
            fontFamily: 'Arial'
        }

        const success = await printLabel(printData, 1)

        if (success) {
            ElMessage.success({
                message: `已打印 ${userName} 的名牌標籤`,
                duration: 3000
            })
            console.log(`成功打印用戶標籤: ${userName}`)
        } else {
            ElMessage.warning({
                message: '標籤列印失敗，請檢查印表機狀態',
                duration: 3000
            })
        }

        return success
    } catch (error) {
        console.error('打印標籤時發生錯誤:', error)
        ElMessage.error({
            message: '打印標籤時發生錯誤',
            duration: 3000
        })
        return false
    }
}

/**---------------掃碼槍設置----------------- */
const { startScan, stopScan, isScanning, setScanCallback } = useBarcodeGun({
    enableScanCallback: true,
    debounceTime: 100,
    autoSubmit: true
});

/**---------------checkin || checkout----------------- */

const member = reactive<any>({});
// 簽到退提交資料
const submitCheckData = reactive<any>({
    attendeesId: "",
    location: "",
    actionType: 1, // 默認簽到模式
});

const clickRecord = reactive<any>({});
const isOptionDialogVisible = ref(false);

// 處理點擊簽到 Icon
const handleClickCheckIcon = async (row: any) => {
    handleSaveLastScrollData(); // 先儲存目前的滾動位置
    if (row.isCheckedIn) {
        isOptionDialogVisible.value = true;
        Object.assign(clickRecord, row);
    } else {
        submitCheckData.attendeesId = row.attendeesId;
        submitCheckData.actionType = 1;
        checkin();
    }
};

const handleDeleteLastCheckinRecord = async () => {
    try {
        await deleteLastCheckinRecordApi(clickRecord.attendeesId);
        ElMessage({
            message: "已撤回簽到紀錄",
            type: "success",
        });
        isOptionDialogVisible.value = false;
        handleUpdateList();
        getCheckData();
    } catch (error) {
        console.log(error);
    }
};

const checkOut = async () => {
    try {
        submitCheckData.attendeesId = clickRecord.attendeesId;
        submitCheckData.actionType = 2;
        let res = await checkinApi(submitCheckData);
        Object.assign(member, res.data);
        console.log("res", res);
        ElMessage.success({
            message: `會員${clickRecord.member.chineseName}:簽退成功`,
            // duration: 1000,
        });
        isOptionDialogVisible.value = false;
        handleUpdateList();
        getCheckData();
    } catch (error) {
        console.log(error);
    }
};

const checkin = async () => {
    try {
        console.log(submitCheckData);
        let res = await checkinApi(submitCheckData);
        Object.assign(member, res.data);
        console.log("res", res);
        let category = "";
        switch (res.data.attendeesVO.member.category) {
            case 1:
                category = "一般會員";
                break;
        }

        console.log(res.data.attendeesVO.isLastYearAttendee);
        const type = submitCheckData.actionType == 1 ? "簽到成功" : "簽退成功";
        if (res.data.attendeesVO.isLastYearAttendee) {
            ElNotification({
                title: `會員編號:${res.data.attendeesVO.sequenceNo}`,
                dangerouslyUseHTMLString: true,
                message: `<p style="color:green;font-weight:bold;">${type}</p> 會員: ${res.data.attendeesVO.member.chineseName}<br/>會員類別: ${category}<br/> <p style="color:green;">為去年年會參加會員</p>`,
                duration: 10000,
                type: "success",
            });
        } else {
            ElNotification({
                title: `會員編號:${res.data.attendeesVO.sequenceNo}`,
                dangerouslyUseHTMLString: true,
                message: `<p style="color:green;font-weight:bold;">${type}</p>會員: ${res.data.attendeesVO.member.chineseName}<br/>會員類別: ${category}<br/><p style="color:red;"> 非去年年會參加會員</p>`,
                duration: 10000,
                type: "success",
            });
        }

        handleUpdateList();
        getCheckData();

        // 自動打印用戶名稱標籤（僅簽到成功時）
        if (submitCheckData.actionType === 1 && res.data?.attendeesVO?.member?.chineseName) {
            setTimeout(() => {
                printUserNameLabel(res.data.attendeesVO.member.chineseName);
            }, 500); // 延遲500ms確保簽到完成
        }

    } catch (error) {
        // console.log(error);
        // ElMessage({
        //   dangerouslyUseHTMLString: true,
        //   message: `<p class='error-msg'>${error}</p>`,
        //   type: "error",
        // });
    }
};

/**---------------掃碼槍回調處理----------------- */
const isScannable = ref(true);

// 掃碼槍掃描成功回調
const handleBarcodeScanned = async (scannedCode: string) => {
    if (!isScannable.value) return;
    isScannable.value = false;

    console.log('掃碼槍掃描成功:', scannedCode);

    try {
        // 解碼 QR 碼內容 (假設是 base64 編碼的 attendeesId)
        submitCheckData.attendeesId = atob(scannedCode);
        await checkin();
    } catch (error) {
        console.error('QR 碼解碼失敗:', error);
        ElMessage({
            message: "QR 碼格式錯誤，請重新掃描",
            type: "error",
        });
    }

    // 防重複掃描
    setTimeout(() => {
        isScannable.value = true;
    }, 500);
};

/**--------------------------------------------------- */

const stats = reactive<any>({
    totalCheckedIn: 0,
    totalLeft: 0,
    totalNotArrived: 0,
    totalOnSite: 0,
    totalShouldAttend: 0,
});

const percentage = ref(0);

const getCheckData = async () => {
    try {
        let res = await getCheckDataApi();
        console.log("res", res);
        percentage.value = Math.round(
            (res.data.totalCheckedIn / res.data.totalShouldAttend) * 100
        );
        Object.assign(stats, res.data);
    } catch (error) {
        console.log(error);
    }
};

/**-------------------------------------------------- */

const showAttendeesList = reactive<any>([]);

const total = ref(0);
const currentPage = ref(1);
const queryText = ref("");

const isLoading = ref(false);
const hasMoreData = ref(true);

const scrollRef = ref();
const lastScrollData = reactive<any>({
    position: 0,
    page: 1,
});
const handleScroll = async (e: any) => {
    let scrollContainer = scrollRef.value;
    // 獲取滾動容器的高度資訊
    const el = scrollContainer.$el || scrollContainer;
    let wrap = el.querySelector(".el-scrollbar__wrap");
    let scrollMoveY = (wrap.scrollTop * 100) / wrap.scrollHeight;
    let poor = (wrap.scrollHeight - wrap.clientHeight);
    if (
        (poor == parseInt(wrap.scrollTop) ||
            poor == Math.ceil(wrap.scrollTop) ||
            poor == Math.floor(wrap.scrollTop)) &&
        !isLoading.value &&
        hasMoreData.value
    ) {
        getAttendeeList();
    }

    if ((poor == parseInt(wrap.scrollTop) || poor == Math.ceil(wrap.scrollTop) || poor == Math.floor(wrap.scrollTop)) && !hasMoreData.value) {
        ElMessage({
            message: "沒有更多資料了",
            type: "warning",
        });
    }
};

const handleSaveLastScrollData = () => {
    const scrollContainer = scrollRef.value;
    // 獲取滾動容器的高度資訊
    const el = scrollContainer.$el || scrollContainer;
    let wrap = el.querySelector(".el-scrollbar__wrap");
    lastScrollData.page = currentPage.value;
    lastScrollData.position = wrap.scrollTop;
};

/**-------------------------------------------------- */
const isDialogVisible = ref(false);
const isPrinterConfigVisible = ref(false)

const openDialog = () => {
    isDialogVisible.value = true;
    handleSaveLastScrollData();
};

// 開啟印表機設定對話框
const openPrinterConfig = () => {
    isPrinterConfigVisible.value = true
    // 等待 DOM 更新後初始化預觽
    nextTick(() => {
        updatePreview()
    })
}

// 測試列印（使用當前預觽設定）
const testPrint = async () => {
    await printUserNameLabel(labelSettings.previewText)
}

const closeDialog = () => {
    isDialogVisible.value = false;
};

const insertFormRef = ref<FormInstance>();

const insertFormData = reactive<any>({
    chineseName: "",
    email: "",
    category: "1",
});

const insertAttendees = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    formEl.validate(async (valid) => {
        if (valid) {
            try {
                let res = await insertAttendeeOnSiteApi(insertFormData);
                console.log("res", res);
                ElMessage({
                    message: "新增成功",
                    type: "success",
                });
                isDialogVisible.value = false;

                handleUpdateList();
                getCheckData();
                formEl.resetFields();
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log("error submit!!");
        }
    });
};

/**-------------------------------------------------- */
const isDrawerVisible = ref(false);
const attendee = reactive<any>({});
const openDrawer = (row: any) => {
    Object.assign(attendee, row);
    console.log("openDrawer", row);
    isDrawerVisible.value = true;
};
const closeDrawer = () => {
    isDrawerVisible.value = false;
};
/**-------------------------------------------------- */
const getAttendeeListForPage = async (page: number) => {
    try {
        let res = await getAttendeeListByTagAndPaginationApi(
            page,
            10,
            queryText.value
        );
        console.log("getAttendeeListForPage", res);
        total.value = res.data.total;
        return res.data || [];
    } catch (error) {
        console.error("Error fetching attendee list:", error);
        return [];
    }
};

const getAttendeeList = async (resetList: boolean = false) => {
    if (isLoading.value && !resetList) return;
    if (!hasMoreData.value && !resetList) return;

    isLoading.value = true; // 開始加載

    try {
        if (resetList) {
            showAttendeesList.length = 0;
            currentPage.value = 1;
            hasMoreData.value = true;
        }
        console.log("currentPage", currentPage.value);
        let res = await getAttendeeListForPage(currentPage.value);
        showAttendeesList.push(...res.records);

        if (res.records.length < 10) {
            hasMoreData.value = false;
        } else {
            hasMoreData.value = true;
        }

        currentPage.value += 1; // 更新當前頁碼
    } catch (error) {
        console.log(error);
    } finally {
        isLoading.value = false; // 結束加載
    }
};

const handleInput = () => {
    getAttendeeList(true);
}

const handleUpdateList = async () => {
    await getAttendeeList(true); // 重置

    if (lastScrollData.page > 1) {
        const pageToLoad = []; // 儲存要加載的頁碼

        for (let i = 2; i <= lastScrollData.page; i++) {
            pageToLoad.push(getAttendeeListForPage(i)); // 加載頁碼 Promise
        }

        const allNewPagesData = await Promise.all(pageToLoad); // 等待所有頁碼的 Promise 完成
        allNewPagesData.forEach((pageData) => {
            showAttendeesList.push(...pageData.records); // 將新頁碼的數據添加到列表中
        });
        currentPage.value = lastScrollData.page + 1; // 更新當前頁碼

        const lastPageData = allNewPagesData[allNewPagesData.length - 1]; // 獲取最後一頁的數據
        if (lastPageData && lastPageData.length < 10) { // 如果最後一頁的數據少於 10，則表示沒有更多數據
            hasMoreData.value = false;
        } else {
            hasMoreData.value = true;// 如果還有數據，則設置為 true
        }

        await nextTick(); // 等待 DOM 更新
        if (scrollRef.value) {
            scrollRef.value.scrollTo({
                top: lastScrollData.position, // 滾動到最後一次記錄的位置
            });
        } else {
            console.log("scrollRef.value不存在");
        }
    } else {
        if (scrollRef.value) {
            scrollRef.value.scrollTo({
                top: 0,
                behavior: "smooth", // 平滑滾動到頂部
            });
        } else {
            console.log("scrollRef.value不存在");
        }
    }
}

const updateEveryMinute = () => {
    setInterval(() => {
        console.log("每分鐘更新");
        getCheckData();
        handleSaveLastScrollData();
        handleUpdateList();
    }, 60000);
};

/**---------------簽到退模式切換----------------- */
const checkActive = ref("checkin");

const switchCheckBtn = (type: string) => {
    checkActive.value = type;
    if (type == "checkin") {
        submitCheckData.actionType = 1;
    } else {
        submitCheckData.actionType = 2;
    }
};

watch(
    checkActive,
    (newVal) => {
        if (newVal == "checkin") {
            submitCheckData.actionType = 1;
        } else {
            submitCheckData.actionType = 2;
        }
    },
    { immediate: true }
);


/**---------------生命週期和初始化----------------- */
onMounted(() => {
    // 設置掃碼槍回調
    setScanCallback(handleBarcodeScanned);

    // 初始化數據
    getCheckData();
    // closeSidebar();
    getAttendeeList();
    updateEveryMinute();

    // 初始化印表機
    initializePrinters()

    console.log('掃碼槍簽到系統已啟動');
});

onUnmounted(() => {
    stopScan(); // 確保組件卸載時停止掃碼監聽
});
</script>
<style lang="scss" scoped>
.main-section {
    width: 100%;
    min-height: 100vh;
    margin: 0 auto;
    position: relative;

    .main-card {
        min-height: 100vh;
        padding-bottom: 2%;
    }

    h1 {
        text-align: center;
        font-size: 2rem;
        margin: 1% 0;
    }
}

:deep(.el-notification) {
    z-index: 9999;
    position: fixed;
    background-color: black;
    top: 20px;
    right: 20px;
}

:deep(.el-form-item__content) {
    .el-select {
        width: 50%;
    }
}

:deep(.el-card__body) {
    padding: 0;
}

.close-btn {
    position: absolute;
    top: 3rem;
    left: 3rem;
    z-index: 99;
}

.switch-btn {
    position: absolute;
    top: 3rem;
    right: 45%;
    z-index: 99;
    display: flex;
    justify-content: center;
    gap: 0;

    .checkin-btn {
        font-size: 1.2rem;
        border-radius: 5px 0 0 5px;
    }

    .checkout-btn {
        font-size: 1.2rem;
        border-radius: 0 5px 5px 0;
        margin: 0;
    }

    .active {
        background-color: #409eff;
        color: white;
    }
}



.component-barcode-reader {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;

    /* 如果掃描視窗內部還有其他容器，可能需要進一步調整 */
    video {
        /* 針對 video 元素 */
        width: 100%;
        height: 100%;
        object-fit: cover;
        /* 讓 video 內容填充整個容器，可能會裁剪 */
    }

    canvas {
        /* 針對 canvas 元素 */
        width: 100% !important;
        /* 使用 !important 覆蓋內聯樣式 */
        height: 100% !important;
    }
}

.data-section {
    display: flex;
    justify-content: center;
    gap: 1rem;
    // max-height: 80vh;

    @media screen and (max-width: 425px) {
        flex-direction: column;
        align-items: center;
    }
}

.function-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    margin-bottom: 1rem;

    .el-form-item {
        margin: 0;
    }

    .el-input {
        font-size: 1.2rem;
        margin-right: 1rem;
    }
}

.checkin-table-box {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #e4e7ed;
    // max-height: 60%;
    width: 35%;
    position: relative;

    @media screen and (max-width: 1024px) {
        width: 45%;
    }

    @media screen and (max-width: 768px) {
        flex: 1;
    }

    @media screen and (max-width: 425px) {
        width: 90%;
    }

    .scroll-box {
        height: 60vh;
    }

    .scan-btn-box {
        display: flex;
        justify-content: center;
    }

    .barcode-gun-status {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f5f7fa;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #909399;

            &.active {
                color: #67c23a;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% {
                    opacity: 1;
                }

                50% {
                    opacity: 0.6;
                }

                100% {
                    opacity: 1;
                }
            }
        }

        .action-mode {
            display: flex;
            gap: 0;

            .checkin-btn {
                font-size: 1rem;
                border-radius: 5px 0 0 5px;
            }

            .checkout-btn {
                font-size: 1rem;
                border-radius: 0 5px 5px 0;
                margin: 0;
            }

            .active {
                background-color: #409eff;
                color: white;
            }
        }
    }

    .checkin-data-card {
        padding: 0.1rem 0.5rem;

        :deep(.el-card__body) {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .member-info {
                flex: 2;
                padding: 0.1rem 1rem;
            }

            .checkin-icon {
                font-size: 2.5rem;
                color: gray;
            }

            .checkin {
                color: green !important;
            }
        }

    }

    .scan-btn {
        width: 5rem;
        height: 5rem;
        aspect-ratio: 1/1;
        // position: absolute;
        // bottom: 1rem;
        // right: 43%;
        background-color: #409eff;
        color: white;
    }
}

.stats-data-box {
    width: 35%;
    padding-left: 1rem;
    margin-top: 1rem;

    @media screen and (max-width: 1024px) {
        width: 45%;
    }

    @media screen and (max-width: 768px) {
        flex: 1;
    }

    @media screen and (max-width: 425px) {
        width: 90%;
    }
}

.total-stats-card {
    width: 70%;
    margin-left: auto;

    @media screen and (max-width: 1024px) {
        width: 100%;
    }

    :deep(.el-card__body) {
        width: 100%;
        justify-content: space-between;
    }

    .stats-data-box {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        gap: 3rem;

        .total-stats-data-card-box {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;

            // gap: 1rem;
            .el-card {
                flex: 1;
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
            }
        }
    }
}

.site-stats-card {
    width: 70%;
    margin-top: 2rem;
    margin-left: auto;

    @media screen and (max-width: 1024px) {
        width: 100%;
    }

    :deep(.el-card__body) {
        width: 100%;
    }

    .site-stats-data-card-box {
        width: 100%;
        display: flex;

        .el-card {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
    }
}

.option-dialog {
    .btn-section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;

        .el-button {
            margin: 0;
            padding: 5rem;

            .content {
                display: flex;
                flex-direction: column;
            }



            .img-box {
                width: 5rem;
                height: 5rem;
                display: flex;
                justify-content: center;
                align-items: center;

                img {
                    width: 1.5rem;
                    height: 1.5rem;
                }

                .icon {
                    font-size: 1.5rem;
                }
            }
        }
    }
}

.attendee-name {
    font-size: 1.2rem;
    font-weight: bold;
}

.primary {
    color: #409eff;
}

.success {
    color: green;
}

.danger {
    color: red;
}

.site-on {
    font-size: 1.2rem;
}

.error-msg {
    font-size: 1.2rem;
}

.insert-form {
    width: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;

    :deep(.el-form-item__label) {
        font-size: 1.2rem;
    }

    .el-form-item {
        width: 100%;
        margin-bottom: 0.5rem;
        text-align: left;

        .el-input {
            width: 100%;
        }
    }
}

.dialog-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;

    .el-button {
        // width: 10rem;
        // height: 3rem;
        font-size: 1.2rem;
        border-radius: 5px;
        padding: 1.5rem;
        text-align: center;

        &:first-child {
            background-color: #f56c6c;
            color: white;
        }
    }
}

@media (max-width: 768px) {
    .barcode-gun-status {
        flex-direction: column !important;
        gap: 1rem;
    }
}
</style>
