# jQuery formChecker Plugin

## 概述

jQuery formChecker Plugin是一个表单验证的插件，来源于实际的GT项目，基本是一个Leazy的nform模块的简化的前端实现。如果后端验证是用的nform，则可以很容易地移植到前端，增强用户体验和减少不必要的后端请求。当然，没用过nform也没关系，这个插件非常简单，同时提供了一定的可配置性。

## 快速开始

1. 引入jQuery，1.4版本以上。

2. 引入jquery.formChecker.js。

3. 对要验证的表单元素使用formChecker，其中的options是一个对象，提供配置信息，详见下面的选项一节。

    $("form").formChecker(options)

4. 获取表单验证通过与否

    var isValid = $("form").formChecker("isValid")

## 选项

### formInput

说明：最主要的选项，用于提供对需要验证的各字段的具体配置。

类型：object

是否必需：是

形式：{'表单输入元素选择器': ['字段描述', '检查器类型', options], ... }

其中，key是要检查的具体元素的选择器，例如'input[name="name"]'。value是一个数组，数组的第一项是该字段的描述，如'姓名'；第二项是检查器的类型名，如'str'，详见后面的检查器一节；第三项是一个object，是供检查器使用的针对单个字段的配置选项，如{'maxLen': 6}，详见后面的检查器选项一节。

### global

说明：用于提供一些对全部字段适用的全局性配置，具体选项和单个字段的配置选项一样，详见后面的检查器选项一节。这些配置会被应用到formInput中每个字段中，但会被单个字段中的同名配置覆盖。

类型：object

是否必需：否

形式：{全局配置项：相应值, ...}

## 检查器

检查器是插件的核心，所有的字段必须指定一个检查器，并提供相应的选项，选项详见下面的检查器选项一节，检查器现提供如下几种：

### 'str'

说明：用于普通字符串的检查

强制规则：无

### 'int'

说明：用于整数的检查

强制规则：只能包含数字

### 'ascii'

说明：继承自'str'，用于限制输入是可打印的ascii字符

强制规则：只能是可打印的ascii字符

### 'chinese'

说明：继承自'str'，用于限制输入为汉字

强制规则：只能是汉字

### 'mobile'

说明：用于手机号码的检查

强制规则：只能是以1开头的11位数字

### 'email'

说明：用于邮箱格式的检查

强制规则：必需符合邮箱的格式，例如example@example.com


## 检查器选项

### callback

说明：用于供用户补充定义检查逻辑的函数，数据会作为第一个参数传给callback，callback需要返回一个二元组[isValid, data]，其中isValid表示是否有效，data在有效时会作为有效数据，在无效时则会作为错误信息。

类型：函数

默认值：function (v) { return [true, v] }

### optional

说明：用于指定字段值可否为空，当为true时，如果字段为空，则会视为有效。

类型：布尔值

默认值：false

### max

说明：对于'int'检查器来说，限制的是最大值；对于'str'及其子检查器来说，限制的是最大长度。

类型：整型

默认值：无

### min

说明：对于'int'检查器来说，限制的是最小值；对于'str'及其子检查器来说，限制的是最小长度。

类型：整型

默认值：无

### format

说明：对'str'及其子检查器适用，指定一个正则表达式，检查时会检查字符串是否符合该正则表达式。

类型：正则表达式

默认值：无

### length

说明：对'str'及其子检查器适用，指定用于计算字符串长度的函数，字符串的值会作为第一个参数传递给该函数，函数需返回一个长度值。

类型：函数

默认值：function (v) { return v.length }

### messages

说明：用于指定验证未通过时提示信息的内容或模板。

类型：对象

默认值：

    {
        max: '%(name) 最大值为%(max)'
        , min: '%(name) 最小值为%(min)'
        , maxLen: '%(name) 最大长度为%(maxLen)个字符'
        , minLen: '%(name) 最小长度为%(minLen)个字符'
        , blank: '%(name) 不能为空'
        , callback: '%(name) 输入出错了'
        , format: '%(name) 格式有错'
        , ascii: '%(name) 不能包含中文'
        , chinese: '%(name) 必须是中文'
        , default: '%(name) 格式有错'
    }

解释：其中max/min对应'int'型数据大小检查的提示信息，maxLen/minLen对应'str'型数据长度检查的提示信息，blank对应数据为空时的提示信息，callback对应callback选项检查未通过时的提示信息，format对应format选项检查未通过时的提示信息，ascii对应'ascii'检查器检查未通过时的提示信息，chinese对应'chinese'检查器检查未通过时的提示信息，default对应其他情况下的提示信息。每一项的值是一个字符串模板，其中的%(var)会被替换成实际的预定义好的var的值，其中name即formInput中各字段的字段描述，max/min/maxLen/minLen对应设置的大小/长度范围值。

### valueGetter

说明：用于指定获取表单输入元素的值的方式

类型：函数

默认值：输入元素的val()值

解释：输入元素对应的jQuery对象会作为第一个参数传递给valueGetter函数，该函数应该返回一个最终用来验证的值。例如：

    valueGetter: function ($element) {
        return $element.val()
    }
            
### fail

说明：用于指定字段验证无效时的行为，一般来说是在界面上显示提示信息。

类型：函数

默认值：无

解释：提示信息(根据messages选项产生)会作为第一个参数传递给fail函数，在函数内部可以用this引用无效输入对应的表单元素的jQuery对象，例如

    fail: function (msg) {
        this.next('.warn').remove().end().after('<span class="warn">' + msg + '</span>')
    }
                                            
### pass

说明：用于指定字段验证通过时的行为。

类型：函数

默认值：无

解释：没有参数，在函数内部可以用this引用有效输入对应的表单元素的jQuery对象，例如

    pass: function () {
        this.next('.warn').remove()
    }
                                        
### isBlurCheck

说明：用于指定是否需要在表单元素失去焦点时自动检查其有效性。

类型：布尔值

默认值：false

## 示例

    $(function () {
        $('form').formChecker({
            global: {
                fail: function (msg) {
                    this.next('.warn').remove()
                        .end().after('<span class="warn">' + msg + '</span>')
                }

                , pass: function () {
                    this.next('.warn').remove()
                }

                , isBlurCheck: true

                , length: function (value) {
                    var s = 0
                    for(var i = 0; i < value.length; i++) {
                        s += value.charAt(i).match(/[\u0391-\uFFE5]/) ? 2 : 1
                    }
                    return s
                }
            }

            , formInput: {
                'input[name="name"]': ['名称', 'str', {
                    max: 255
                }]
                , 'input[name="qq"]': ['QQ', 'str', {
                    max: 16
                    , format: /^\d+$/
                }]
                , 'select[name="city_id"]': ['城市', 'int', {
                    min: 1
                    , messages: {blank: '请选择', 'default': '请选择'}
                }]
             }

        })

        $('form').submit(function () {
            return $(this).formChecker("isValid")
        })
    })
     
