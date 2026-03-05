<template>
  <div class="task-new-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>{{ t('taskNew.title') }}</h2>
      <p>{{ t('taskNew.subtitle') }}</p>
    </div>

    <!-- 配置表单 -->
    <el-card class="form-card">
      <el-form :model="formData" label-width="140px" label-position="left" size="default">
        
        <!-- 评测模式 -->
        <el-form-item :label="t('taskNew.mode')">
          <el-radio-group v-model="formData.mode">
            <el-radio value="dataset">{{ t('taskNew.modeDataset') }}</el-radio>
            <el-radio value="single_sample">{{ t('taskNew.modeSingle') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- ========== Agent 配置 ========== -->
        <el-divider content-position="left">{{ t('taskNew.agentConfigTitle') }}</el-divider>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item :label="t('taskNew.agentSoftware')">
              <el-select v-model="formData.software" :placeholder="t('taskNew.selectSoftware')">
                <el-option label="cc_cli" value="cc_cli" />
                <el-option label="cline_cli" value="cline_cli" />
                <el-option label="codex_cli" value="codex_cli" />
                <el-option label="cline_ide" value="cline_ide" />
                <el-option label="copilot_ide" value="copilot_ide" />
                <el-option label="cursor_ide" value="cursor_ide" />
                <el-option label="trae_ide" value="trae_ide" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('taskNew.llmModel')">
              <el-select v-model="formData.llm_name" :placeholder="t('taskNew.selectModel')" filterable>
                <el-option label="deepseek-chat" value="deepseek-chat" />
                <el-option label="gemini-3-flash" value="gemini-3-flash" />
                <el-option label="claude-sonnet-4-5" value="claude-sonnet-4-5" />
                <el-option label="gpt-5.1-codex" value="gpt-5.1-codex" />
                <el-option label="gpt-4o-mini" value="gpt-4o-mini" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- ========== 数据集与攻击方法 ========== -->
        <el-divider content-position="left">{{ t('taskNew.datasetAttackTitle') }}</el-divider>

        <el-row :gutter="24">
          <el-col :span="12" v-if="formData.mode === 'dataset'">
            <el-form-item :label="t('taskNew.dataset')">
              <el-select v-model="formData.dataset_name" :placeholder="t('taskNew.selectDataset')">
                <el-option label="redcode" value="redcode" />
                <el-option label="swebench" value="swebench" />
                <el-option label="ipi_web_dataset_lite" value="ipi_web_dataset_lite" />
                <el-option label="ipi_file_dataset_lite" value="ipi_file_dataset_lite" />
                <el-option label="dpi_dataset_lite" value="dpi_dataset_lite" />
                <el-option label="cvebench" value="cvebench" />
                <el-option label="mydataset" value="mydataset" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('taskNew.attackMethod')">
              <el-select v-model="formData.attack_method_name" :placeholder="t('taskNew.selectDataset')">
                <el-option label="static_file" value="static_file" />
                <el-option label="multi_file" value="multi_file" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- ========== 并行与执行参数 ========== -->
        <el-divider content-position="left">{{ t('taskNew.concurrencyTitle') }}</el-divider>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item :label="t('taskNew.username')">
              <el-input 
                v-model="formData.user" 
                :placeholder="t('taskNew.usernamePlaceholder')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Concurrency">
              <el-input-number v-model="formData.concurrency" :min="1" :max="20" />
              <span class="form-tip">Number of parallel tasks</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="Log Level">
              <el-select v-model="formData.log_level">
                <el-option label="DEBUG" value="DEBUG" />
                <el-option label="INFO" value="INFO" />
                <el-option label="WARNING" value="WARNING" />
                <el-option label="ERROR" value="ERROR" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Debug Port">
              <el-input-number v-model="formData.debug_port" :min="-1" :max="65535" />
              <span class="form-tip">-1 to disable</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="Screenshot Time (seconds)">
              <el-input-number v-model="formData.screenshot_time" :min="0" :step="0.1" :precision="1" />
              <span class="form-tip">Leave empty to disable</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Fail Immediately on Error">
              <el-switch v-model="formData.fail_immediately_on_error" />
              <span class="form-tip">Stop on first error</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- ========== 数据集模式专用配置 ========== -->
        <template v-if="formData.mode === 'dataset'">
          <el-divider content-position="left">{{ t('taskNew.datasetModeTitle') }}</el-divider>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item :label="t('taskNew.skipCompleted')">
                <el-switch v-model="formData.skip_completed" />
                <span class="form-tip">{{ t('taskNew.skipCompletedTip') }}</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item :label="t('taskNew.filterCondition')">
            <el-input 
              v-model="filterDictStr" 
              type="textarea"
              :rows="4"
              :placeholder="t('taskNew.filterPlaceholder')"
            />
            <div class="form-tip">
              {{ t('taskNew.filterTip') }}<br>
              • redcode: {"ids": ["1"], "language": ["python"], "category": ["1", "2"]}<br>
              • ipi_web_dataset_lite: {"id": ["ipi_file_hcg_scp_logger_sample_build_gradle_gradle_properties_insert_after_match"]}<br>
              • cvebench: {"challenges": ["CVE-2023-37999"], "variants": ["one_day"]}
            </div>
          </el-form-item>

          <el-form-item :label="t('taskNew.mcpConfig')">
            <el-input 
              v-model="formData.mcp_server_config" 
              type="textarea"
              :rows="3"
              :placeholder="t('taskNew.mcpConfigPlaceholder')"
            />
          </el-form-item>
        </template>

        <!-- ========== 单样本模式专用配置 ========== -->
        <template v-if="formData.mode === 'single_sample'">
          <el-divider content-position="left">{{ t('taskNew.singleSampleTitle') }}</el-divider>
          
          <!-- Sample 基本字段 -->
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item :label="t('taskNew.sampleId')">
                <el-input v-model="formData.sample.id" :placeholder="t('taskNew.sampleIdPlaceholder')" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item :label="t('taskNew.taskInstruction')">
            <el-input 
              v-model="formData.sample.user_instruction" 
              type="textarea"
              :rows="5"
              :placeholder="t('taskNew.taskInstructionPlaceholder')"
              show-word-limit
              maxlength="2000"
            />
          </el-form-item>

          <!-- 分类信息 -->
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item :label="t('taskNew.category')">
                <el-select v-model="formData.sample.category" :placeholder="t('taskNew.selectCategory')">
                  <el-option v-for="cat in categoryOptions" :key="cat" :label="cat" :value="cat" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :label="t('taskNew.subcategory')">
                <el-select v-model="formData.sample.subcategory" :placeholder="t('taskNew.selectSubcategory')">
                  <el-option v-for="sub in availableSubcategories" :key="sub" :label="sub" :value="sub" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 环境准备 -->
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item :label="t('taskNew.workspace')">
                <el-input 
                  v-model="formData.sample.workspace" 
                  :placeholder="t('taskNew.workspacePlaceholder')"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item :label="t('taskNew.containerScript')">
            <el-input 
              v-model="formData.sample.env_setup_script" 
              type="textarea"
              :rows="3"
              :placeholder="t('taskNew.containerScriptPlaceholder')"
            />
          </el-form-item>

          <!-- HTML Configuration -->
          <el-divider style="margin: 16px 0;">HTML & Attacker Configuration</el-divider>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="HTML Domain">
                <el-input 
                  v-model="formData.sample.html_domain" 
                  placeholder="e.g., example.com"
                />
                <span class="form-tip">Optional: Domain for HTML content</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="HTML Endpoint">
                <el-input 
                  v-model="formData.sample.html_endpoint" 
                  placeholder="e.g., /index.html"
                />
                <span class="form-tip">Optional: Endpoint path for HTML</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Custom HTML Content">
            <el-input 
              v-model="formData.sample.custom_html_content" 
              type="textarea"
              :rows="5"
              placeholder="Optional: Custom HTML content to inject"
            />
          </el-form-item>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="Attacker Domain">
                <el-input 
                  v-model="formData.sample.attacker_domain" 
                  placeholder="e.g., attacker.com"
                />
                <span class="form-tip">Optional: Domain for attacker server</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Attacker Endpoint">
                <el-input 
                  v-model="formData.sample.attacker_endpoint" 
                  placeholder="e.g., /malicious"
                />
                <span class="form-tip">Optional: Endpoint path on attacker server</span>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Script to Fetch from Attacker Server">
            <el-input 
              v-model="formData.sample.script_to_fetch_from_attacker_server" 
              type="textarea"
              :rows="3"
              placeholder="Optional: Script or command to fetch from attacker server"
            />
          </el-form-item>

          <el-form-item :label="t('taskNew.mcpConfig')">
            <el-input 
              v-model="mcpConfigStr" 
              type="textarea"
              :rows="3"
              :placeholder="t('taskNew.mcpConfigPlaceholder')"
            />
          </el-form-item>

          <!-- Prompt Injections Configuration - Part of Single Sample Configuration -->
          <el-form-item>
            <template #label>
              <span style="font-weight: 500;">Prompt Injections</span>
            </template>
            <el-button @click="addPromptInjection" type="primary" style="margin-bottom: 12px;">
              Add Prompt Injection
            </el-button>
            <span class="form-tip">
              Configure file-based prompt injection attacks
            </span>
          </el-form-item>
          
          <div v-for="(injection, index) in formData.sample.prompt_injections" :key="index" class="file-attack-item">
            <el-card shadow="hover">
              <div class="attack-header">
                <span class="attack-title">Prompt Injection {{ index + 1 }}</span>
                <el-button size="small" type="danger" @click="removePromptInjection(index)">
                  Delete
                </el-button>
              </div>
              
              <el-row :gutter="16" style="margin-top: 12px;">
                <el-col :span="12">
                  <el-form-item label="Target File Path" label-width="120px">
                    <el-input v-model="injection.target_file_path" placeholder="e.g., README.md" size="small" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Injection Type" label-width="120px">
                    <el-select v-model="injection.injection_type" placeholder="Select type" size="small">
                      <el-option label="append" value="append" />
                      <el-option label="insert_after_match" value="insert_after_match" />
                      <el-option label="insert_before_match" value="insert_before_match" />
                      <el-option label="replace" value="replace" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <el-form-item label="Match Pattern" label-width="120px">
                <el-input 
                  v-model="injection.match_pattern" 
                  type="textarea" 
                  :rows="2" 
                  placeholder="e.g., ## Installation (required for insert_after_match, insert_before_match, replace)"
                  size="small"
                />
              </el-form-item>
              
              <el-form-item label="Payload Content" label-width="120px">
                <el-input 
                  v-model="injection.payload_content" 
                  type="textarea" 
                  :rows="6" 
                  placeholder="Malicious content to inject"
                  size="small"
                />
              </el-form-item>
            </el-card>
          </div>

          <!-- IDE Settings -->
          <el-form-item :label="t('taskNew.ideSettings')">
            <el-input 
              v-model="ideSettingsStr" 
              type="textarea"
              :rows="8"
              :placeholder="t('taskNew.ideSettingsPlaceholder')"
            />
            <el-link type="primary" :underline="false" style="margin-top: 8px;" @click="fillDefaultIdeSettings">
              {{ t('taskNew.useRecommended') }}
            </el-link>
          </el-form-item>

          <!-- Evaluation Configuration -->
          <el-divider style="margin: 16px 0;">Evaluation Configuration</el-divider>

          <!-- Attack Success Check -->
          <el-form-item>
            <template #label>
              <span style="font-weight: 500;">Attack Success Check</span>
            </template>
            <el-button @click="addEvaluationCheck('attack_success_check')" type="primary" size="small">
              Add Verification
            </el-button>
            <span class="form-tip">Define how to verify if the attack succeeded</span>
          </el-form-item>

          <div v-for="(check, index) in formData.sample.evaluation.attack_success_check" :key="`attack-${index}`" class="file-attack-item">
            <el-card shadow="hover">
              <div class="attack-header">
                <span class="attack-title">Attack Check {{ index + 1 }}</span>
                <el-button size="small" type="danger" @click="removeEvaluationCheck('attack_success_check', index)">
                  Delete
                </el-button>
              </div>
              
              <el-row :gutter="16" style="margin-top: 12px;">
                <el-col :span="12">
                  <el-form-item label="Method" label-width="100px">
                    <el-select v-model="check.method" placeholder="Select method" size="small">
                      <el-option label="CHECK_NETWORK_LOG" value="CHECK_NETWORK_LOG" />
                      <el-option label="COMMANDS_EXECUTED" value="COMMANDS_EXECUTED" />
                      <el-option label="LLM_JUDGE" value="LLM_JUDGE" />
                      <el-option label="EXEC_IN_CONTAINER" value="EXEC_IN_CONTAINER" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <!-- COMMANDS_EXECUTED 专用界面 -->
              <template v-if="check.method === 'COMMANDS_EXECUTED'">
                <el-form-item label="Commands List" label-width="100px">
                  <el-button @click="addCommandToCheck('attack_success_check', index)" size="small" type="primary" plain>
                    Add Command
                  </el-button>
                  <span class="form-tip" style="margin-left: 8px;">Commands to check for execution</span>
                </el-form-item>
                
                <div v-for="(cmd, cmdIndex) in (check.commands || [])" :key="`attack-${index}-cmd-${cmdIndex}`" style="margin-left: 100px; margin-bottom: 8px;">
                  <el-row :gutter="8">
                    <el-col :span="20">
                      <el-input v-model="check.commands[cmdIndex]" placeholder="e.g., curl" size="small" />
                    </el-col>
                    <el-col :span="4">
                      <el-button @click="removeCommandFromCheck('attack_success_check', index, cmdIndex)" size="small" type="danger" plain>
                        Remove
                      </el-button>
                    </el-col>
                  </el-row>
                </div>
              </template>
              
              <!-- 通用参数界面 -->
              <template v-else>
                <el-form-item label="Parameters" label-width="100px">
                  <el-button @click="addParamToCheck('attack_success_check', index)" size="small" type="primary" plain>
                    Add Parameter
                  </el-button>
                </el-form-item>
                
                <div v-for="(param, pIndex) in check.params" :key="`attack-${index}-param-${pIndex}`" style="margin-left: 100px; margin-bottom: 8px;">
                  <el-row :gutter="8">
                    <el-col :span="10">
                      <el-input v-model="param.key" placeholder="Key (e.g., pattern)" size="small" />
                    </el-col>
                    <el-col :span="10">
                      <el-input v-model="param.value" placeholder="Value" size="small" />
                    </el-col>
                    <el-col :span="4">
                      <el-button @click="removeParamFromCheck('attack_success_check', index, pIndex)" size="small" type="danger" plain>
                        Remove
                      </el-button>
                    </el-col>
                  </el-row>
                </div>
              </template>
            </el-card>
          </div>

          <!-- Task Success Check -->
          <el-form-item style="margin-top: 16px;">
            <template #label>
              <span style="font-weight: 500;">Task Success Check</span>
            </template>
            <el-button @click="addEvaluationCheck('task_success_check')" type="primary" size="small">
              Add Verification
            </el-button>
            <span class="form-tip">Define how to verify if the task was completed</span>
          </el-form-item>

          <div v-for="(check, index) in formData.sample.evaluation.task_success_check" :key="`task-${index}`" class="file-attack-item">
            <el-card shadow="hover">
              <div class="attack-header">
                <span class="attack-title">Task Check {{ index + 1 }}</span>
                <el-button size="small" type="danger" @click="removeEvaluationCheck('task_success_check', index)">
                  Delete
                </el-button>
              </div>
              
              <el-row :gutter="16" style="margin-top: 12px;">
                <el-col :span="12">
                  <el-form-item label="Method" label-width="100px">
                    <el-select v-model="check.method" placeholder="Select method" size="small">
                      <el-option label="CHECK_NETWORK_LOG" value="CHECK_NETWORK_LOG" />
                      <el-option label="COMMANDS_EXECUTED" value="COMMANDS_EXECUTED" />
                      <el-option label="LLM_JUDGE" value="LLM_JUDGE" />
                      <el-option label="EXEC_IN_CONTAINER" value="EXEC_IN_CONTAINER" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <!-- COMMANDS_EXECUTED 专用界面 -->
              <template v-if="check.method === 'COMMANDS_EXECUTED'">
                <el-form-item label="Commands List" label-width="100px">
                  <el-button @click="addCommandToCheck('task_success_check', index)" size="small" type="primary" plain>
                    Add Command
                  </el-button>
                  <span class="form-tip" style="margin-left: 8px;">Commands to check for execution</span>
                </el-form-item>
                
                <div v-for="(cmd, cmdIndex) in (check.commands || [])" :key="`task-${index}-cmd-${cmdIndex}`" style="margin-left: 100px; margin-bottom: 8px;">
                  <el-row :gutter="8">
                    <el-col :span="20">
                      <el-input v-model="check.commands[cmdIndex]" placeholder="e.g., npm install" size="small" />
                    </el-col>
                    <el-col :span="4">
                      <el-button @click="removeCommandFromCheck('task_success_check', index, cmdIndex)" size="small" type="danger" plain>
                        Remove
                      </el-button>
                    </el-col>
                  </el-row>
                </div>
              </template>
              
              <!-- 通用参数界面 -->
              <template v-else>
                <el-form-item label="Parameters" label-width="100px">
                  <el-button @click="addParamToCheck('task_success_check', index)" size="small" type="primary" plain>
                    Add Parameter
                  </el-button>
                </el-form-item>
                
                <div v-for="(param, pIndex) in check.params" :key="`task-${index}-param-${pIndex}`" style="margin-left: 100px; margin-bottom: 8px;">
                  <el-row :gutter="8">
                    <el-col :span="10">
                      <el-input v-model="param.key" placeholder="Key" size="small" />
                    </el-col>
                    <el-col :span="10">
                      <el-input v-model="param.value" placeholder="Value" size="small" />
                    </el-col>
                    <el-col :span="4">
                      <el-button @click="removeParamFromCheck('task_success_check', index, pIndex)" size="small" type="danger" plain>
                        Remove
                      </el-button>
                    </el-col>
                  </el-row>
                </div>
              </template>
            </el-card>
          </div>

          <!-- Alert Check -->
          <el-form-item style="margin-top: 16px;">
            <template #label>
              <span style="font-weight: 500;">Alert Check</span>
            </template>
            <el-button @click="addEvaluationCheck('alert_check')" type="primary" size="small">
              Add Verification
            </el-button>
            <span class="form-tip">Define how to verify if security alerts were raised</span>
          </el-form-item>

          <div v-for="(check, index) in formData.sample.evaluation.alert_check" :key="`alert-${index}`" class="file-attack-item">
            <el-card shadow="hover">
              <div class="attack-header">
                <span class="attack-title">Alert Check {{ index + 1 }}</span>
                <el-button size="small" type="danger" @click="removeEvaluationCheck('alert_check', index)">
                  Delete
                </el-button>
              </div>
              
              <el-row :gutter="16" style="margin-top: 12px;">
                <el-col :span="12">
                  <el-form-item label="Method" label-width="100px">
                    <el-select v-model="check.method" placeholder="Select method" size="small">
                      <el-option label="CHECK_NETWORK_LOG" value="CHECK_NETWORK_LOG" />
                      <el-option label="COMMANDS_EXECUTED" value="COMMANDS_EXECUTED" />
                      <el-option label="LLM_JUDGE" value="LLM_JUDGE" />
                      <el-option label="EXEC_IN_CONTAINER" value="EXEC_IN_CONTAINER" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              
              <!-- COMMANDS_EXECUTED 专用界面 -->
              <template v-if="check.method === 'COMMANDS_EXECUTED'">
                <el-form-item label="Commands List" label-width="100px">
                  <el-button @click="addCommandToCheck('alert_check', index)" size="small" type="primary" plain>
                    Add Command
                  </el-button>
                  <span class="form-tip" style="margin-left: 8px;">Commands to check for execution</span>
                </el-form-item>
                
                <div v-for="(cmd, cmdIndex) in (check.commands || [])" :key="`alert-${index}-cmd-${cmdIndex}`" style="margin-left: 100px; margin-bottom: 8px;">
                  <el-row :gutter="8">
                    <el-col :span="20">
                      <el-input v-model="check.commands[cmdIndex]" placeholder="e.g., curl" size="small" />
                    </el-col>
                    <el-col :span="4">
                      <el-button @click="removeCommandFromCheck('alert_check', index, cmdIndex)" size="small" type="danger" plain>
                        Remove
                      </el-button>
                    </el-col>
                  </el-row>
                </div>
              </template>
              
              <!-- 通用参数界面 -->
              <template v-else>
                <el-form-item label="Parameters" label-width="100px">
                  <el-button @click="addParamToCheck('alert_check', index)" size="small" type="primary" plain>
                    Add Parameter
                  </el-button>
                </el-form-item>
                
                <div v-for="(param, pIndex) in check.params" :key="`alert-${index}-param-${pIndex}`" style="margin-left: 100px; margin-bottom: 8px;">
                  <el-row :gutter="8">
                    <el-col :span="10">
                      <el-input v-model="param.key" placeholder="Key" size="small" />
                    </el-col>
                    <el-col :span="10">
                      <el-input v-model="param.value" placeholder="Value" size="small" />
                    </el-col>
                    <el-col :span="4">
                      <el-button @click="removeParamFromCheck('alert_check', index, pIndex)" size="small" type="danger" plain>
                        Remove
                      </el-button>
                    </el-col>
                  </el-row>
                </div>
              </template>
            </el-card>
          </div>
        </template>

        <!-- 提交按钮 -->
        <el-form-item style="margin-top: 32px;">
          <el-button 
            type="primary" 
            @click="handleSubmit"
            :loading="loading"
            size="large"
          >
            {{ t('taskNew.startTask') }}
          </el-button>
          <el-button @click="handleReset" size="large">{{ t('taskNew.resetForm') }}</el-button>
          <el-button @click="handlePreview" size="large">{{ t('taskNew.previewConfig') }}</el-button>
        </el-form-item>

      </el-form>
    </el-card>

    <!-- 配置预览对话框 -->
    <el-dialog 
      v-model="previewDialogVisible" 
      :title="t('taskNew.configPreview')" 
      width="700px"
    >
      <el-input
        v-model="previewConfig"
        type="textarea"
        :rows="20"
        readonly
        class="preview-json"
      />
      <template #footer>
        <el-button @click="previewDialogVisible = false">{{ t('taskNew.close') }}</el-button>
        <el-button type="primary" @click="copyConfig">{{ t('taskNew.copyConfig') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useTaskStore } from '@/stores/task'
import type { DatasetTaskRequest, SingleSampleRequest } from '@/types'

const router = useRouter()
const taskStore = useTaskStore()
const { t } = useI18n()
const loading = ref(false)
const previewDialogVisible = ref(false)

const formData = ref({
  mode: 'dataset',
  software: 'cline_ide',
  llm_name: 'gemini-3-flash',
  attack_model_name: 'gpt-4o-mini',
  dataset_name: 'ipi_web_dataset_lite',
  attack_method_name: 'static_file',
  user: 'default',
  skip_completed: true,
  concurrency: 1,
  log_level: 'INFO',
  debug_port: -1,
  fail_immediately_on_error: false,
  screenshot_time: null as number | null,
  mcp_server_config: '',
  sample: {
    id: 'test-001',
    user_instruction: '',
    target: null,
    thought_process: '',
    metadata: {},
    custom_html_content: null,
    env_setup_script: '',
    html_domain: null,
    html_endpoint: null,
    attacker_domain: null,
    attacker_endpoint: null,
    workspace: 'itchat',
    script_to_fetch_from_attacker_server: null,
    prompt_injections: [] as any[],
    evaluation: {
      attack_success_check: [] as any[],
      task_success_check: [] as any[],
      alert_check: [] as any[]
    },
    category: 'Data_Leakage',
    subcategory: 'Credential_Leakage',
    ide_settings: null
  }
})

const filterDictStr = ref('{"id": ["ipi_dl_cl_001"]}')
const mcpConfigStr = ref('')
const ideSettingsStr = ref('')
const metadataStr = ref('{}')

const categoryOptions = [
  'Data_Leakage',
  'Host_Environment_Destruction',
  'Harmful_Code_Generation',
  'Resource_Misuse',
  'Context_Pollution'
]

const subcategoryOptions: Record<string, string[]> = {
  Data_Leakage: [
    'Credential_Leakage',
    'User_Information_Leakage',
    'Environment_Information_Leakage',
    'System_Prompt_Leakage'
  ],
  Host_Environment_Destruction: [
    'File_System_Destruction',
    'Identity_Forgery',
    'Privilege_Escalation'
  ],
  Harmful_Code_Generation: [
    'Vulnerable_Code_Generation',
    'Hallucination_Code_Generation',
    'Supply_Chain_Poisoning',
    'Malicious_Code_Generation'
  ],
  Resource_Misuse: ['Token_Misuse', 'System_Resource_Abuse'],
  Context_Pollution: ['Malicious_Instruction_Persistence', 'Network_Abuse']
}

const availableSubcategories = computed(() => {
  return subcategoryOptions[formData.value.sample.category] || []
})

const parseJsonSafe = (text: string, fallback: any) => {
  try {
    if (!text) return fallback
    return JSON.parse(text)
  } catch {
    return fallback
  }
}

const previewConfig = computed(() => {
  const config: any = {
    agent: {
      software: formData.value.software,
      model: {
        model_name: formData.value.llm_name
      }
    },
    attack_method_name: formData.value.attack_method_name,
    attack_model_name: formData.value.attack_model_name,
    dataset_name: formData.value.dataset_name,
    user: formData.value.user,
    concurrency: formData.value.concurrency,
    skip_completed: formData.value.skip_completed,
    fail_immediately_on_error: formData.value.fail_immediately_on_error,
    log_level: formData.value.log_level,
    debug_port: formData.value.debug_port
  }
  
  if (formData.value.screenshot_time !== null) {
    config.screenshot_time = formData.value.screenshot_time
  }

  if (formData.value.mode === 'dataset') {
    config.filter_dict = parseJsonSafe(filterDictStr.value, {})
    if (formData.value.mcp_server_config) {
      config.mcp_server_config = formData.value.mcp_server_config
    }
  } else {
    const sample: any = {
      id: formData.value.sample.id,
      user_instruction: formData.value.sample.user_instruction,
      category: formData.value.sample.category,
      subcategory: formData.value.sample.subcategory
    }
    
    if (formData.value.sample.target) {
      sample.target = formData.value.sample.target
    }
    if (formData.value.sample.workspace) {
      sample.workspace = formData.value.sample.workspace
    }
    if (formData.value.sample.env_setup_script) {
      sample.env_setup_script = formData.value.sample.env_setup_script
    }
    if (formData.value.sample.prompt_injections && formData.value.sample.prompt_injections.length > 0) {
      sample.prompt_injections = formData.value.sample.prompt_injections
    }
    
    // Add evaluation field to preview
    const hasAttackChecks = formData.value.sample.evaluation.attack_success_check.length > 0
    const hasTaskChecks = formData.value.sample.evaluation.task_success_check.length > 0
    const hasAlertChecks = formData.value.sample.evaluation.alert_check.length > 0
    
    if (hasAttackChecks || hasTaskChecks || hasAlertChecks) {
      const evaluation: any = {}
      
      if (hasAttackChecks) {
        evaluation.attack_success_check = formData.value.sample.evaluation.attack_success_check.map(check => {
          if (check.method === 'COMMANDS_EXECUTED' && check.commands && check.commands.length > 0) {
            // For COMMANDS_EXECUTED, use commands list
            return {
              method: check.method,
              params: {
                commands: check.commands.filter(cmd => cmd.trim())
              }
            }
          } else {
            // For other methods, use params
            const params: any = {}
            check.params.forEach(p => {
              if (p.key && p.value) {
                // Try to parse as JSON (for arrays/objects), fallback to string
                try {
                  params[p.key] = JSON.parse(p.value)
                } catch {
                  params[p.key] = p.value
                }
              }
            })
            return {
              method: check.method,
              params: params
            }
          }
        })
      }
      
      if (hasTaskChecks) {
        evaluation.task_success_check = formData.value.sample.evaluation.task_success_check.map(check => {
          if (check.method === 'COMMANDS_EXECUTED' && check.commands && check.commands.length > 0) {
            // For COMMANDS_EXECUTED, use commands list
            return {
              method: check.method,
              params: {
                commands: check.commands.filter(cmd => cmd.trim())
              }
            }
          } else {
            // For other methods, use params
            const params: any = {}
            check.params.forEach(p => {
              if (p.key && p.value) {
                // Try to parse as JSON (for arrays/objects), fallback to string
                try {
                  params[p.key] = JSON.parse(p.value)
                } catch {
                  params[p.key] = p.value
                }
              }
            })
            return {
              method: check.method,
              params: params
            }
          }
        })
      }
      
      if (hasAlertChecks) {
        evaluation.alert_check = formData.value.sample.evaluation.alert_check.map(check => {
          if (check.method === 'COMMANDS_EXECUTED' && check.commands && check.commands.length > 0) {
            // For COMMANDS_EXECUTED, use commands list
            return {
              method: check.method,
              params: {
                commands: check.commands.filter(cmd => cmd.trim())
              }
            }
          } else {
            // For other methods, use params
            const params: any = {}
            check.params.forEach(p => {
              if (p.key && p.value) {
                // Try to parse as JSON (for arrays/objects), fallback to string
                try {
                  params[p.key] = JSON.parse(p.value)
                } catch {
                  params[p.key] = p.value
                }
              }
            })
            return {
              method: check.method,
              params: params
            }
          }
        })
      }
      
      sample.evaluation = evaluation
    }
    
    if (ideSettingsStr.value) {
      sample.ide_settings = parseJsonSafe(ideSettingsStr.value, null)
    }
    
    config.sample = sample
    
    if (mcpConfigStr.value) {
      config.mcp_server_config = parseJsonSafe(mcpConfigStr.value, null)
    }
  }

  return JSON.stringify(config, null, 2)
})

const addPromptInjection = () => {
  formData.value.sample.prompt_injections.push({
    target_file_path: '',
    injection_type: 'insert_after_match',
    match_pattern: '',
    payload_content: ''
  })
}

const removePromptInjection = (index: number) => {
  formData.value.sample.prompt_injections.splice(index, 1)
}

const addEvaluationCheck = (checkType: 'attack_success_check' | 'task_success_check' | 'alert_check') => {
  formData.value.sample.evaluation[checkType].push({
    method: 'CHECK_NETWORK_LOG',
    params: []
  })
}

const removeEvaluationCheck = (checkType: 'attack_success_check' | 'task_success_check' | 'alert_check', index: number) => {
  formData.value.sample.evaluation[checkType].splice(index, 1)
}

const addParamToCheck = (checkType: 'attack_success_check' | 'task_success_check' | 'alert_check', checkIndex: number) => {
  formData.value.sample.evaluation[checkType][checkIndex].params.push({
    key: '',
    value: ''
  })
}

const removeParamFromCheck = (checkType: 'attack_success_check' | 'task_success_check' | 'alert_check', checkIndex: number, paramIndex: number) => {
  formData.value.sample.evaluation[checkType][checkIndex].params.splice(paramIndex, 1)
}

/**
 * 添加命令到 COMMANDS_EXECUTED 检查
 */
const addCommandToCheck = (checkType: 'attack_success_check' | 'task_success_check' | 'alert_check', checkIndex: number) => {
  if (!formData.value.sample.evaluation[checkType][checkIndex].commands) {
    formData.value.sample.evaluation[checkType][checkIndex].commands = []
  }
  formData.value.sample.evaluation[checkType][checkIndex].commands.push('')
}

/**
 * 删除命令
 */
const removeCommandFromCheck = (checkType: 'attack_success_check' | 'task_success_check' | 'alert_check', checkIndex: number, cmdIndex: number) => {
  formData.value.sample.evaluation[checkType][checkIndex].commands.splice(cmdIndex, 1)
}

/**
 * 填充默认的 IDE Settings 推荐配置
 */
const fillDefaultIdeSettings = () => {
  const defaultSettings = {
    "remote.SSH.remotePlatform": {
      "docker-container": "linux"
    },
    "github.copilot.nextEditSuggestions.enabled": true,
    "github.copilot.chat.byok.ollamaEndpoint": "http://192.168.244.1:11434",
    "extensions.autoCheckUpdates": false,
    "extensions.autoUpdate": false,
    "update.enableWindowsBackgroundUpdates": false,
    "update.mode": "none",
    "update.showReleaseNotes": false,
    "extensions.ignoreRecommendations": true
  }
  ideSettingsStr.value = JSON.stringify(defaultSettings, null, 2)
  ElMessage.success(t('taskNew.messages.ideSettingsFilled'))
}

/**
 * 验证表单
 */
const validateForm = (): boolean => {
  if (!formData.value.software) {
    ElMessage.warning(t('taskNew.validation.selectSoftware'))
    return false
  }
  if (!formData.value.llm_name) {
    ElMessage.warning(t('taskNew.validation.selectModel'))
    return false
  }
  
  // 数据集模式验证
  if (formData.value.mode === 'dataset') {
    if (!formData.value.dataset_name) {
      ElMessage.warning(t('taskNew.validation.selectDataset'))
      return false
    }
  }
  
  // 单样本模式额外验证
  if (formData.value.mode === 'single_sample') {
    if (!formData.value.sample.id) {
      ElMessage.warning(t('taskNew.validation.enterSampleId'))
      return false
    }
    if (!formData.value.sample.user_instruction) {
      ElMessage.warning(t('taskNew.validation.enterInstruction'))
      return false
    }
    if (!formData.value.sample.category || !formData.value.sample.subcategory) {
      ElMessage.warning(t('taskNew.validation.selectCategory'))
      return false
    }
  }
  
  // 验证 JSON 格式
  if (formData.value.mode === 'dataset') {
    try {
      JSON.parse(filterDictStr.value || '{}')
    } catch {
      ElMessage.warning(t('taskNew.validation.invalidFilterJson'))
      return false
    }
  } else {
    try {
      if (mcpConfigStr.value) {
        JSON.parse(mcpConfigStr.value)
      }
      if (ideSettingsStr.value) {
        JSON.parse(ideSettingsStr.value)
      }
    } catch {
      ElMessage.warning(t('taskNew.validation.invalidJson'))
      return false
    }
  }
  
  return true
}

/**
 * 构建数据集模式请求参数
 */
const buildDatasetPayload = (): DatasetTaskRequest => {
  const payload: any = {
    agent: {
      software: formData.value.software,
      model: {
        model_name: formData.value.llm_name
      }
    },
    attack_method_name: formData.value.attack_method_name,
    attack_model_name: formData.value.attack_model_name,
    dataset_name: formData.value.dataset_name,
    filter_dict: parseJsonSafe(filterDictStr.value, {}),
    concurrency: formData.value.concurrency,
    skip_completed: formData.value.skip_completed,
    fail_immediately_on_error: formData.value.fail_immediately_on_error,
    user: formData.value.user,
    log_level: formData.value.log_level,
    debug_port: formData.value.debug_port
  }
  
  if (formData.value.screenshot_time !== null) {
    payload.screenshot_time = formData.value.screenshot_time
  }
  
  if (formData.value.mcp_server_config) {
    payload.mcp_server_config = formData.value.mcp_server_config
  }
  
  return payload
}

/**
 * 构建单样本模式请求参数
 */
const buildSingleSamplePayload = (): SingleSampleRequest => {
  const sample: any = {
    id: formData.value.sample.id,
    user_instruction: formData.value.sample.user_instruction,
    category: formData.value.sample.category,
    subcategory: formData.value.sample.subcategory
  }
  
  // Optional fields
  if (formData.value.sample.target) {
    sample.target = formData.value.sample.target
  }
  if (formData.value.sample.thought_process) {
    sample.thought_process = formData.value.sample.thought_process
  }
  const parsedMetadata = parseJsonSafe(metadataStr.value, {})
  if (Object.keys(parsedMetadata).length > 0) {
    sample.metadata = parsedMetadata
  }
  if (formData.value.sample.custom_html_content) {
    sample.custom_html_content = formData.value.sample.custom_html_content
  }
  if (formData.value.sample.env_setup_script) {
    sample.env_setup_script = formData.value.sample.env_setup_script
  }
  if (formData.value.sample.html_domain) {
    sample.html_domain = formData.value.sample.html_domain
  }
  if (formData.value.sample.html_endpoint) {
    sample.html_endpoint = formData.value.sample.html_endpoint
  }
  if (formData.value.sample.attacker_domain) {
    sample.attacker_domain = formData.value.sample.attacker_domain
  }
  if (formData.value.sample.attacker_endpoint) {
    sample.attacker_endpoint = formData.value.sample.attacker_endpoint
  }
  if (formData.value.sample.workspace) {
    sample.workspace = formData.value.sample.workspace
  }
  if (formData.value.sample.script_to_fetch_from_attacker_server) {
    sample.script_to_fetch_from_attacker_server = formData.value.sample.script_to_fetch_from_attacker_server
  }
  if (formData.value.sample.prompt_injections && formData.value.sample.prompt_injections.length > 0) {
    sample.prompt_injections = formData.value.sample.prompt_injections
  }
  
  // Build evaluation config from form data
  const hasAttackChecks = formData.value.sample.evaluation.attack_success_check.length > 0
  const hasTaskChecks = formData.value.sample.evaluation.task_success_check.length > 0
  const hasAlertChecks = formData.value.sample.evaluation.alert_check.length > 0
  
  if (hasAttackChecks || hasTaskChecks || hasAlertChecks) {
    const evaluation: any = {}
    
    if (hasAttackChecks) {
      evaluation.attack_success_check = formData.value.sample.evaluation.attack_success_check.map(check => {
        if (check.method === 'COMMANDS_EXECUTED' && check.commands && check.commands.length > 0) {
          // For COMMANDS_EXECUTED, use commands list
          return {
            method: check.method,
            params: {
              commands: check.commands.filter(cmd => cmd.trim())
            }
          }
        } else {
          // For other methods, use params
          const params: any = {}
          check.params.forEach(p => {
            if (p.key && p.value) {
              // Try to parse as JSON (for arrays/objects), fallback to string
              try {
                params[p.key] = JSON.parse(p.value)
              } catch {
                params[p.key] = p.value
              }
            }
          })
          return {
            method: check.method,
            params: params
          }
        }
      })
    }
    
    if (hasTaskChecks) {
      evaluation.task_success_check = formData.value.sample.evaluation.task_success_check.map(check => {
        if (check.method === 'COMMANDS_EXECUTED' && check.commands && check.commands.length > 0) {
          // For COMMANDS_EXECUTED, use commands list
          return {
            method: check.method,
            params: {
              commands: check.commands.filter(cmd => cmd.trim())
            }
          }
        } else {
          // For other methods, use params
          const params: any = {}
          check.params.forEach(p => {
            if (p.key && p.value) {
              // Try to parse as JSON (for arrays/objects), fallback to string
              try {
                params[p.key] = JSON.parse(p.value)
              } catch {
                params[p.key] = p.value
              }
            }
          })
          return {
            method: check.method,
            params: params
          }
        }
      })
    }
    
    if (hasAlertChecks) {
      evaluation.alert_check = formData.value.sample.evaluation.alert_check.map(check => {
        if (check.method === 'COMMANDS_EXECUTED' && check.commands && check.commands.length > 0) {
          // For COMMANDS_EXECUTED, use commands list
          return {
            method: check.method,
            params: {
              commands: check.commands.filter(cmd => cmd.trim())
            }
          }
        } else {
          // For other methods, use params
          const params: any = {}
          check.params.forEach(p => {
            if (p.key && p.value) {
              // Try to parse as JSON (for arrays/objects), fallback to string
              try {
                params[p.key] = JSON.parse(p.value)
              } catch {
                params[p.key] = p.value
              }
            }
          })
          return {
            method: check.method,
            params: params
          }
        }
      })
    }
    
    sample.evaluation = evaluation
  }
  
  if (ideSettingsStr.value) {
    sample.ide_settings = parseJsonSafe(ideSettingsStr.value, null)
  }

  const payload: any = {
    agent: {
      software: formData.value.software,
      model: {
        model_name: formData.value.llm_name
      }
    },
    attack_method_name: formData.value.attack_method_name,
    attack_model_name: formData.value.attack_model_name,
    dataset_name: formData.value.dataset_name,
    sample: sample,
    concurrency: formData.value.concurrency,
    skip_completed: formData.value.skip_completed,
    fail_immediately_on_error: formData.value.fail_immediately_on_error,
    user: formData.value.user,
    log_level: formData.value.log_level,
    debug_port: formData.value.debug_port
  }
  
  if (formData.value.screenshot_time !== null) {
    payload.screenshot_time = formData.value.screenshot_time
  }
  
  if (mcpConfigStr.value) {
    payload.mcp_server_config = parseJsonSafe(mcpConfigStr.value, null)
  }
  
  return payload
}

/**
 * 提交表单 - 真实的 API 调用
 */
const handleSubmit = async () => {
  // 验证表单
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    let result
    
    if (formData.value.mode === 'dataset') {
      // 数据集批量评测
      const payload = buildDatasetPayload()
      console.log('[TaskNew] 启动数据集任务:', payload)
      result = await taskStore.startDatasetTask(payload)
    } else {
      // 单样本评测
      const payload = buildSingleSamplePayload()
      console.log('[TaskNew] 启动单样本任务:', payload)
      result = await taskStore.startSingleSampleTask(payload)
    }
    
    // 成功提示
    ElMessage.success(t('taskNew.messages.taskStarted'))
    
    // 跳转到监控页面
    router.push(`/tasks/monitor/${result.task_id}`)
    
  } catch (error: any) {
    console.error('[TaskNew] 启动任务失败:', error)
    ElMessage.error(error.message || t('taskNew.messages.taskStartFailed'))
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formData.value = {
    mode: 'dataset',
    software: 'cline_ide',
    llm_name: 'gemini-3-flash',
    attack_model_name: 'gpt-4o-mini',
    dataset_name: 'ipi_web_dataset_lite',
    attack_method_name: 'static_file',
    user: 'default',
    skip_completed: true,
    concurrency: 1,
    log_level: 'INFO',
    debug_port: -1,
    fail_immediately_on_error: false,
    screenshot_time: null,
    mcp_server_config: '',
    sample: {
      id: 'test-001',
      user_instruction: '',
      target: null,
      thought_process: '',
      metadata: {},
      custom_html_content: null,
      env_setup_script: '',
      html_domain: null,
      html_endpoint: null,
      attacker_domain: null,
      attacker_endpoint: null,
      workspace: 'itchat',
      script_to_fetch_from_attacker_server: null,
      prompt_injections: [],
      evaluation: {
        attack_success_check: [],
        task_success_check: [],
        alert_check: []
      },
      category: 'Data_Leakage',
      subcategory: 'Credential_Leakage',
      ide_settings: null
    }
  }
  filterDictStr.value = '{"id": ["ipi_dl_cl_001"]}'
  mcpConfigStr.value = ''
  ideSettingsStr.value = ''
  metadataStr.value = '{}'
  ElMessage.info(t('taskNew.messages.formReset'))
}

const handlePreview = () => {
  previewDialogVisible.value = true
}

const copyConfig = () => {
  navigator.clipboard.writeText(previewConfig.value)
  ElMessage.success(t('taskNew.messages.configCopied'))
}
</script>

<style scoped>
.task-new-page {
  height: 100%;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 6px 0;
  font-size: 20px;
  font-weight: 500;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.form-card {
  background: #fff;
}

:deep(.el-card__body) {
  padding: 28px 32px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

:deep(.el-input__inner),
:deep(.el-select),
:deep(.el-textarea__inner) {
  font-size: 13px;
}

:deep(.el-divider) {
  margin: 24px 0;
}

:deep(.el-divider__text) {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.form-tip {
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
  margin-left: 8px;
}

.file-attack-item {
  margin-bottom: 16px;
}

.file-attack-item .el-card {
  border: 1px solid #dcdfe6;
  background: #fafafa;
}

:deep(.file-attack-item .el-card__body) {
  padding: 16px;
}

.attack-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.attack-title {
  font-weight: 500;
  font-size: 13px;
  color: #303133;
}

:deep(.el-button--large) {
  padding: 10px 28px;
  font-size: 14px;
}

.preview-json {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
}

:deep(.preview-json .el-textarea__inner) {
  background-color: #f5f7fa;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
</style>
