!function ($) {

    var defaultMessages = {
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

    , defaultOptions = {
        callback: function (v) { return [true, v] }
        , optional: false
    }

    , _super = function (Child, obj) {
        return $.proxy(Child._super, obj)
    }

    , _inherit = function (Child, Parent) {
        Child.prototype = new Parent()
        Child.prototype.constructor = Child
        Child._super = Parent
    }

    , kformat = function (string, value) {
        return string.replace(/%\(([^)]+)\)/g, function(match, name) { 
            return typeof value[name] != 'undefined'
                ? value[name]
                : match
        })
    }

    , types


    function Input($element, fieldName, options) {
        this.$element = $element
        this._messages = $.extend({}, defaultMessages)
        this._messageVars = {
            name: fieldName
        }

        this._init(options)
    }

    Input.prototype._init = function (options) {
        var that = this

        this.options = $.extend({}, defaultOptions, options)
        this._optional = this.options.optional
        this._callback = this.options.callback
        this._valueGetter = this.options.valueGetter || this._valueGetter

        typeof this.options.messages == 'object' && $.extend(this._messages, this.options.messages)
        typeof this.options.required == 'boolean' && (this.optional = !this.optional.required)
        
        if (typeof this.options.max == 'number') {
            this._max = this.options.max
            this._messageVars['max'] = this._max
            this._messageVars['maxLen'] = this._max
        }

        if (typeof this.options.min == 'number') {
            this._min = this.options.min
            this._messageVars['min'] = this._min
            this._messageVars['minLen'] = this._min
        }

        this.options.isBlurCheck && this.$element.blur(function () { that.check() })
    }

    Input.prototype.checkValue = function (raw) {
        var valid = false
        , validData = null
        , message = null
        , value = raw
        , r
        , valid
        , data

        if (value) {
            r = this._check(value) 
            valid = r[0]
            data = r[1]

            if (valid) {
                r = this._callback(data)
                valid = r[0]
                data = r[1]
                if (valid)
                    validData = data
                else
                    message  = data
            } else
                message = data
        } else if (this._optional) {
            valid = true
            validData = value
        } else
            message = this._messages['blank']

        if (message)
            message = kformat(message, this._messageVars)

        return [valid, raw, validData, message]
    }

    Input.prototype.check = function () {
        var value = this._valueGetter(this.$element)
        , r = this.checkValue(value)
        , valid = r[0]
        , m = r[3]

        if (valid && this.options.pass) this.options.pass.call(this.$element)
        else if (!valid && this.options.fail) this.options.fail.call(this.$element, m)

        return r
    }

    Input.prototype._valueGetter = function ($element) {
        return $element.val()
    }

    Input.prototype._checkMM = function (value) {
        if (this._max && value > this._max) {
            this._messageKey = 'max'
            return false
        }

        if (this._min && value < this._min) {
            this._messageKey = 'min'
            return false
        }

        return true
    }


    // Str Input
    function Str($input, fieldName, options) {
        _super(Str, this)($input, fieldName, options)
        this._format = this.options.format
        this._length = this.options.length || this._length
    }

    _inherit(Str, Input)

    Str.prototype._check = function (value) {
        var message

        if (!this._checkMM(this._length(value))) {
            message = this._messages[this._messageKey + 'Len']
            return [false, message]
        }

        if (this._format && !this._format.test(value))
            return [false, this._messages['format']]
        
        return [true, value]
    }

    Str.prototype._length = function (value) {
        return value.length
    }


    // ASCII Input
    function ASCII($input, fieldName, options) {
        _super(ASCII, this)($input, fieldName, options)
    }

    _inherit(ASCII, Str)

    ASCII.prototype._check = function (value) {
        var message

        if (!/^[\040-\176]*$/.test(value)) {
            return [false, this._messages['format']]            
        }

        if (!this._checkMM(this._length(value))) {
            message = this._messages[this._messageKey + 'Len']
            return [false, message]
        }

        if (this._format && !this._format.test(value))
            return [false, this._messages['ascii']]
        
        return [true, value]
    }

    
    // Chinese Input
    function Chinese($input, fieldName, options) {
        _super(Chinese, this)($input, fieldName, options)
    }

    _inherit(Chinese, Str)

    Chinese.prototype._check = function (value) {
        var message

        if (!/^[\u4E00-\u9FA5]*$/.test(value)) {
            return [false, this._messages['chinese']]            
        }

        if (!this._checkMM(this._length(value))) {
            message = this._messages[this._messageKey + 'Len']
            return [false, message]
        }

        if (this._format && !this._format.test(value))
            return [false, this._messages['format']]
        
        return [true, value]
    }


    // Email Input
    function Email($input, fieldName, options) {
        _super(Email, this)($input, fieldName, options)
    }

    _inherit(Email, Str)

    Email.prototype._check = function (value) {
        if (!this._checkMM(this._length(value))) {
            message = this._messages[this._messageKey + 'Len']
            return [false, message]
        }

        if (!/^[\w.%+-]+@(?:[A-Z0-9-]+\.)+[A-Z]{2,4}$/i.test(value))
            return [false, this._messages['default']]
        
        return [true, value]
    }


    // Int Input
    function Int($input, fieldName, options) {
        _super(Int, this)($input, fieldName, options)
    }

    _inherit(Int, Input)

    Int.prototype._check = function (value) {
        if (!/^\d+$/.test(value))
            return [false, this._messages['default']]

        value = Number(value)

        if (value === NaN)
            return [false, this._messages['default']]            
        
        if (!this._checkMM(value)) {
            message = this._messages[this._messageKey]
            return [false, message]
        }

        return [true, value]
    }


    // Mobile Input
    function Mobile($input, fieldName, options) {
        _super(Mobile, this)($input, fieldName, options)
    }

    _inherit(Mobile, Input)

    Mobile.prototype._check = function (value) {
        if (!/^1\d{10}$/.test(value))
            return [false, this._messages['default']]
        return [true, value]
    }

    types = {
        str: Str
        , int: Int
        , ascii: ASCII
        , chinese: Chinese
        , mobile: Mobile
        , email: Email
    }

    // main FormCheker class definition
    function FormChecker(element, options) {
        var that = this

        this.$element = $(element)
        this.options = $.extend({}, $.fn.formChecker.defaults, options)
        this.global = typeof options.global == 'object' && options.global
        this.form = this.options.formInput
        this.inputs = {}

        $.each(this.form, function (field, rawChecker) {
            var fieldName = rawChecker[0]
            , type = rawChecker[1]
            , checkerOption = rawChecker[2]
            , $input = that.$element.find(field)

            that.inputs[field] = new types[type](
                $input, fieldName, $.extend({}, that.global, checkerOption))
        })
    }

    FormChecker.prototype.check = function () {
        var validData = {}
        , rawData = {}
        , messages = {}
        , $input
        , value
        , that = this

        this._valid = true

        $.each(this.inputs, function (field, input) {
            var r
            , valid
            , v
            , m

            r = input.check()
            valid = r[0]
            rawData[field] = r[1]
            v = r[2]
            m = r[3]
            
            if (valid) {
                validData[field] =v
            } else {
                messages[field] = m
            }

            that._valid = that._valid && valid

        })

        this._rawData = rawData
        this._validData = validData
        this._messages = messages
    }

    FormChecker.prototype.isValid = function () {
        this.check()
        return this._valid
    }


    // exposed to jQuery
    $.fn.formChecker = function (option) {
        return this.each(function () {
            var $this = $(this)
            , data = $this.data('formChecker')
            , options = typeof option == 'object' && option

            if (!data) $this.data('formChecker', (data = new FormChecker(this, options)))
            if (typeof option == 'string') data[option]()
        })
    }

    $.fn.formChecker.defaults = {

    }

}(window.jQuery);
