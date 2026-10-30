<template>
  <div class="insert-member-form-box">
    <el-form class="insert-form" :model="data" ref="formRef" label-position="top" validate-on-rule-change>
      <el-form-item label="國家" prop="country" :rules="countryRules">
        <el-select v-model="data.country" filterable placeholder="國家">
          <el-option v-for="item in countries" :value="item" :label="item" :key="item" />
        </el-select>
      </el-form-item>

      <el-form-item class="title-form-item" label="稱謂" prop="title" :rules="titleRules">
        <el-radio-group class="title-radio-group" v-model="data.title" placeholder="稱謂">
          <el-radio v-for="title in memberTitles" :key="title" :label="title" :value="title" />
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="isTaiwan" label="中文姓名" prop="chineseName" :rules="chineseNameRules">
        <el-input v-model="data.chineseName" placeholder="中文名" />
      </el-form-item>
      <el-form-item label="英文名" prop="firstName" :rules="firstNameRules">
        <el-input v-model="data.firstName" placeholder="名字" />
      </el-form-item>
      <el-form-item label="英文姓氏" prop="lastName" :rules="lastNameRules">
        <el-input v-model="data.lastName" placeholder="姓氏" />
      </el-form-item>
      <el-form-item v-if="!isTaiwan" label="中文姓名">
        <el-input v-model="data.chineseName" placeholder="中文名" />
      </el-form-item>
      <el-form-item label="身分證字號/護照號碼" prop="idCard" :rules="isTaiwan ? idCardRules : passportRules">
        <el-input v-model="data.idCard" placeholder="身份證字號/護照號碼" />
      </el-form-item>

      <el-form-item label="E-mail" prop="email" :rules="emailRules">
        <el-input v-model="data.email" placeholder="E-mail" />
      </el-form-item>
      <el-form-item label="密碼" prop="password" :rules="passwordRules">
        <el-input v-model="data.password" placeholder="密碼" type="password" />
      </el-form-item>
      <el-form-item label="確認密碼" prop="confirmPassword" :rules="confirmPasswordRules(() => data.password)">
        <el-input v-model="data.confirmPassword" placeholder="確認密碼" type="password" />
      </el-form-item>
      <el-form-item label="所屬機構" prop="affiliation" :rules="affiliationRules">
        <el-input v-model="data.affiliation" placeholder="單位" />
      </el-form-item>
      <el-form-item label="職稱" prop="jobTitle" :rules="jobTitleRules">
        <el-input v-model="data.jobTitle" placeholder="職稱" />
      </el-form-item>
      <div class="phone-section">
        <el-form-item label="國碼" prop="countryCode" class="country-code" :rules="countryCodeRules">
          <el-input v-model="data.countryCode" />
        </el-form-item>
        -
        <el-form-item label="連絡電話" prop="phone" class="phone" :rules="phoneRules">
          <el-input v-model="data.phone" placeholder="連絡電話" />
        </el-form-item>
      </div>
      <el-form-item label="食物偏好" prop="food">
        <el-radio-group v-model="data.food" style="margin-left: 1rem;">
          <el-radio value="葷">葷</el-radio>
          <el-radio value="素">素</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="食物禁忌" prop="foodTaboo">
        <el-input v-model="data.foodTaboo" placeholder="食物禁忌" style="width: 240px;" />
      </el-form-item>
      <el-form-item label="抬頭" prop="receipt">
        <el-input v-model="data.receipt" placeholder="抬頭" />
      </el-form-item>
      <el-form-item class="category required" label="類別" prop="category" :rules="categoryRules">
        <el-select v-model="data.category">
          <el-option v-for="id in vipCategoryIds" :key="id" :label="memberEnums[id]" :value="id" />
        </el-select>
      </el-form-item>
    </el-form>

    <div class="btn-box">
      <el-button type="primary" :loading="submitting" @click="submitInsertForm(formRef)">送出</el-button>
      <el-button @click="emits('close')">取消</el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Member, CreateVipMemberPayload } from '@/api/member/type';
import { FormInstance } from 'element-plus';
import countriesData from '@/assets/data/countries.json'

import { firstNameRules, lastNameRules, countryCodeRules, countryRules, affiliationRules, jobTitleRules, chineseNameRules, passwordRules, confirmPasswordRules, categoryRules, emailRules, phoneRules, titleRules, passportRules, idCardRules } from '@/utils/rules'
import { memberEnums, memberTitles, vipCategoryIds } from '@/enums/MemberEnum'
import { addVipMemberApi } from '@/api/member';
import { tryCatch } from '@/utils/tryCatch'

const emits = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const countries = ref(countriesData)

const createDefaultData = (): Member => ({
  country: 'Taiwan',
  title: 'Prof.',
  firstName: '',
  lastName: '',
  chineseName: '',
  email: '',
  password: '',
  confirmPassword: '',
  affiliation: '',
  jobTitle: '',
  idCard: '',
  countryCode: '886',
  phone: '',
  food: '葷',
  foodTaboo: '',
  receipt: '',
  category: 4,
  status: 1,
});

const data = ref<Member>(createDefaultData());
const formRef = ref<FormInstance>();
const submitting = ref(false)
const isTaiwan = computed(() => data.value.country === 'Taiwan')

//不改動表單資料，組出送給 API 的 payload
const buildPayload = (): CreateVipMemberPayload => {
  const { confirmPassword, countryCode, ...rest } = data.value
  return { ...rest, phone: countryCode + rest.phone }
}

const submitInsertForm = async (form: FormInstance | undefined) => {
  if (!form || submitting.value) return

  const valid = await form.validate().catch(() => false)
  if (!valid) {
    ElMessage.error("請完整填入資訊")
    return
  }

  submitting.value = true
  const { error } = await tryCatch(addVipMemberApi(buildPayload()))
  submitting.value = false

  //失敗時保留使用者輸入，dialog 不關閉
  if (error) return

  ElMessage.success('新增成功');
  form.resetFields()
  emits('success')
  emits('close')
}

</script>

<style lang="scss" scoped>
.insert-form {
  padding: 2rem;
  width: 90%;
  margin-inline: auto;

  .el-select {
    width: 100%;
  }

  .el-input {
    width: 100%;
  }

  .category {

    :deep(.el-form-item__error) {
      position: absolute;
      top: 0.5rem;
      left: 10rem;
      width: 20rem;

      @media screen and (max-width: 768px) {
        left: 13rem;
      }
    }

    :deep(.el-select) {
      width: 150px;
    }

  }

  .phone-section {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    gap: 1rem;

    .country-code {
      width: 30%;
    }

    .phone {
      width: 70%;
    }
  }

  .title-form-item {
    width: 100%;

    .title-radio-group {
      width: 100%
    }
  }


}

.btn-box {
  text-align: center;
  display: flex;
  justify-content: flex-end;

  .el-button {
    margin: 0 1rem;
  }
}
</style>
