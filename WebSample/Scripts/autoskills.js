/*
*
* Author reddream
*
*
* */

(function ($) {

    $.filterskills = {
        widget: null,
        skillsinput: null,
        filtervals: null,
        splitestr: ",",
        autocomplete: null,
        init: function (opt) {
            this.opt = { wg: "", className: "", sk: "", url: "" };
            $.extend(this.opt, opt);
            this.widget = $("#" + this.opt.wg);
            this.skillsinput = $("#" + this.opt.sk);
            var me = this;
            this.widget.click(function () {
                me.skillsinput.focus();
                me.widget.addClass("isFocus");
            });
            this.filtervals = $($("." + this.opt.className)[0]);
            var onAutocompleteSelect = function (value, data, el) {
            };
            var textInEl = function (value, el, ev) {
                $.filterskills.fill(value, ev);
            };
            var options = {
                serviceUrl: this.opt.url,
                width: 210,
                delimiter: /(,|;)\s*/,
                onSelect: onAutocompleteSelect,
                deferRequestBy: 0,
                params: { country: 'Yes' },
                noCache: true,
                textInEl: textInEl
            };
            this.autocomplete = $('#' + this.opt.sk).autocomplete(options);
        },
        isin: function (v) {
            var sval = this.filtervals.val();
            var sarray = sval.split(this.splitestr);
            return $.inArray(v, sarray);
        },
        val: function (v) {
            var sval = this.filtervals.val();
            if ($.trim(sval) == "") {
                this.filtervals.val(v);
                return;
            }
            var sarray = sval.split(this.splitestr);
            if ($.inArray(v, sarray) == -1) {
                sarray.push(v);
            }
            if (sarray.length > 0)
                this.filtervals.val(sarray.join(","));
            else
                this.filtervals.val("");
        },
        rm: function (v) {
            var sval = this.filtervals.val();
            if ($.trim(sval) == "")
                return;
            var sarray = sval.split(this.splitestr);
            var narray = [];
            for (var i = 0; i < sarray.length; i++) {
                if (sarray[i] != v) {
                    narray.push(sarray[i]);
                }
            }
            this.filtervals.val(narray.join(this.splitestr));
        },
        fill: function (value, ev) {
            value = $.trim(value);
            if (value != "" && this.isin(value) == -1) {
                var qo = { query: value };
                var me = this;
                $.ajax({
                    type: "POST",
                    url: me.opt.url,
                    dataType: "json",
                    data: qo,
                    timeout: 120000,
                    beforeSend: function () {
                        $.messager.progress();
                    },
                    success: function (arr) {
                        $.messager.progress('close');
                        var el = me.skillsinput;
                        el.val("");
                        if (arr.suggestions.length == 0) {
                            me.autocomplete.shownorecognize();
                        } else {
                            el.before("<div class=\"oTag oSkill\" >" + arr.query + "<button class=\"oBtnCloseMini\" ></button></div>");
                            el.prev().find(".oBtnCloseMini").attr("v", arr.query).click(function () {
                                $(this).parent().remove();
                                var vv = $(this).attr("v");
                                me.rm(vv);
                            });
                            me.val(arr.query);
                        }
                    },
                    error: function () {
                        $.messager.progress('close');
                    }
                });

            }
            if (ev != undefined) {
                var evt = $(ev.target);
                if (evt[0].id != this.widget[0].id && evt.parents('.oTagsField').size() === 0) {
                    this.widget.removeClass("isFocus");
                }
            }
        },
        fillvalues: function (values) {
            if ($.trim(values) != "") {
                var vnarray = values.split(this.splitestr);
                for (var i = 0; i < vnarray.length; i++) {
                    var v = vnarray[i];
                    if ($.trim(v) != "")
                        this.fill(v);
                }
            }
        },
        getvalues: function () {
            return this.filtervals.val();
        }
    };




    var reEscape = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'].join('|\\') + ')', 'g');

    function fnFormatResult(value, data, currentValue) {
        var pattern = '(' + currentValue.replace(reEscape, '\\$1') + ')';
        return value.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>');
    }

    function Autocomplete(el, options) {
        this.el = $(el);
        this.el.attr('autocomplete', 'off');
        this.suggestions = [];
        this.data = [];
        this.badQueries = [];
        this.selectedIndex = -1;
        this.currentValue = this.el.val();
        this.intervalId = 0;
        this.cachedResponse = [];
        this.onChangeInterval = null;
        this.ignoreValueChange = false;
        this.serviceUrl = options.serviceUrl;
        this.isLocal = false;
        this.options = {
            autoSubmit: false,
            minChars: 1,
            maxHeight: 300,
            deferRequestBy: 0,
            width: 0,
            highlight: true,
            params: {},
            fnFormatResult: fnFormatResult,
            delimiter: null,
            zIndex: 9999,
            textInEl: null
        };
        this.initialize();
        this.setOptions(options);
    }

    $.fn.autocomplete = function (options) {
        return new Autocomplete(this.get(0) || $('<input />'), options);
    };


    Autocomplete.prototype = {

        killerFn: null,

        initialize: function () {

            var me, uid, autocompleteElId;
            me = this;
            uid = Math.floor(Math.random() * 0x100000).toString(16);
            autocompleteElId = 'Autocomplete_' + uid;

            this.killerFn = function (e) {
                if ($(e.target).parents('.autocomplete').size() === 0) {//click outside the container,this way is good to discover that.
                    me.killSuggestions();
                    me.disableKillerFn();
                    me.notregonize.hide();
                    var fn = me.options.textInEl;
                    if ($.isFunction(fn)) {
                        fn(me.el.val(), me.el, e);
                    }
                }
            };

            if (!this.options.width) { this.options.width = this.el.width(); }
            this.mainContainerId = 'AutocompleteContainter_' + uid;


            $('<div id="' +
                this.mainContainerId +
                '" style="position:absolute;z-index:9999;">' +
                '<div class="autocomplete-w1">' +
                '<div class="autocomplete" id="' +
                autocompleteElId + '" ' +
                'style="display:none; width:300px;"></div>' +
                '</div>' +
                '</div>').appendTo('body');
            this.notregonizeId = "NotregonizeId" + uid;
            $("<div id='" + this.notregonizeId + "' style=\"position: absolute;z-index:10005;\" class=\"oFieldSuggest\"><ul>" +
            "<li class=\"oNotRecognized\">This skill is not recognized.</li></ul></div>").appendTo("body");
            this.notregonize = $("#" + this.notregonizeId);
            this.notregonize.hide();
            this.container = $('#' + autocompleteElId);
            this.fixPosition();
            if (window.opera) {
                this.el.keypress(function (e) { me.onKeyPress(e); });
            } else {
                this.el.keydown(function (e) { me.onKeyPress(e); });
            }
            this.el.keyup(function (e) { me.onKeyUp(e); });
            this.el.blur(function () { me.enableKillerFn(); });
            this.el.focus(function () { me.fixPosition(); });
        },

        setOptions: function (options) {
            var o = this.options;
            $.extend(o, options);
            if (o.lookup) {
                this.isLocal = true;
                if ($.isArray(o.lookup)) { o.lookup = { suggestions: o.lookup, data: [] }; }
            }
            $('#' + this.mainContainerId).css({ zIndex: o.zIndex });
            this.container.css({ maxHeight: o.maxHeight + 'px', width: o.width });
        },

        clearCache: function () {
            this.cachedResponse = [];
            this.badQueries = [];
        },

        disable: function () {
            this.disabled = true;
        },

        enable: function () {
            this.disabled = false;
        },

        fixPosition: function () {
            var offset = this.el.offset();
            $('#' + this.mainContainerId).css({ top: (offset.top + this.el.innerHeight()) + 'px', left: offset.left + 'px' });
        },

        fixPositionNotRecognize: function () {
            var offset = this.el.offset();
            this.notregonize.css({ top: (offset.top + this.el.innerHeight()) + 'px', left: offset.left + 'px' });
        },

        enableKillerFn: function () {
            var me = this;
            $(document).bind('click', me.killerFn);
        },

        disableKillerFn: function () {
            var me = this;
            $(document).unbind('click', me.killerFn);
        },

        killSuggestions: function () {
            var me = this;
            this.stopKillSuggestions();
            this.intervalId = window.setInterval(function () { me.hide(); me.stopKillSuggestions(); }, 300);
        },

        stopKillSuggestions: function () {
            window.clearInterval(this.intervalId);
        },

        onfill: function () {
            var me = this;
            var fn2 = me.options.textInEl;
            if ($.isFunction(fn2)) {
                fn2(me.el.val(), me.el);
            }
        },

        onKeyPress: function (e) {
            if (this.disabled || !this.enabled) {
                if (e.keyCode == 13) {
                    this.hide();
                    this.onfill();
                }
                return;
            }
            // return will exit the function
            // and event will not be prevented

            switch (e.keyCode) {
                case 27: //KEY_ESC:
                    this.el.val(this.currentValue);
                    this.hide();
                    break;
                case 9: //KEY_TAB:
                case 13: //KEY_RETURN:
                    if (this.selectedIndex === -1) {
                        this.hide();
                        this.onfill();
                        return;
                    }
                    this.select(this.selectedIndex);
                    if (e.keyCode === 9) { return; }
                    break;
                case 38: //KEY_UP:
                    this.moveUp();
                    break;
                case 40: //KEY_DOWN:
                    this.moveDown();
                    break;
                default:
                    return;
            }
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        onKeyUp: function (e) {
            if (this.disabled) { return; }
            switch (e.keyCode) {
                case 38: //KEY_UP:
                case 40: //KEY_DOWN:
                    return;
            }
            clearInterval(this.onChangeInterval);
            if (this.currentValue !== this.el.val()) {
                if (this.options.deferRequestBy > 0) {
                    // Defer lookup in case when value changes very quickly:
                    var me = this;
                    this.onChangeInterval = setInterval(function () { me.onValueChange(); }, this.options.deferRequestBy);
                } else {
                    this.onValueChange();
                }
            }
        },

        onValueChange: function () {
            clearInterval(this.onChangeInterval);
            this.currentValue = this.el.val();
            var q = this.getQuery(this.currentValue);
            this.selectedIndex = -1;
            if (this.ignoreValueChange) { //blog the other requests
                this.ignoreValueChange = false;
                return;
            }
            if (q === '' || q.length < this.options.minChars) {
                this.hide();
            } else {
                this.getSuggestions(q);
            }
        },

        getQuery: function (val) {
            var d, arr;
            d = this.options.delimiter;
            if (!d) { return $.trim(val); }
            arr = val.split(d);
            return $.trim(arr[arr.length - 1]);
        },

        getSuggestionsLocal: function (q) {
            var ret, arr, len, val, i;
            arr = this.options.lookup;
            len = arr.suggestions.length;
            ret = { suggestions: [], data: [] };
            q = q.toLowerCase();
            for (i = 0; i < len; i++) {
                val = arr.suggestions[i];
                if (val.toLowerCase().indexOf(q) === 0) {
                    ret.suggestions.push(val);
                    ret.data.push(arr.data[i]);
                }
            }
            return ret;
        },

        getSuggestions: function (q) {
            var cr, me;
            cr = this.isLocal ? this.getSuggestionsLocal(q) : this.cachedResponse[q];
            if (cr && $.isArray(cr.suggestions)) {
                this.suggestions = cr.suggestions;
                this.data = cr.data;
                this.suggest();
            } else if (!this.isBadQuery(q)) {
                me = this;
                me.options.params.query = q;
                //reddream
                $.get(this.serviceUrl, me.options.params, function (txt) { me.processResponse(txt); }, 'text');
            }
        },

        isBadQuery: function (q) {
            var i = this.badQueries.length;
            while (i--) {
                if (q.indexOf(this.badQueries[i]) === 0) { return true; }
            }
            return false;
        },

        hide: function () {
            this.enabled = false;
            this.selectedIndex = -1;
            this.container.hide();
        },
        shownorecognize: function () {
            this.el.val("");
            this.notregonize.show();
            this.fixPositionNotRecognize();
            this.disableKillerFn();
            this.enableKillerFn();
        },
        suggest: function () {
            if (this.suggestions.length === 0) {
                this.hide();
                return;
            }
            var me, len, div, f, v, i, s, mOver, mClick;
            me = this;
            len = this.suggestions.length;
            f = this.options.fnFormatResult;
            v = this.getQuery(this.currentValue);
            mOver = function (xi) { return function () { me.activate(xi); }; };
            mClick = function (xi) { return function () { me.select(xi); }; };
            this.container.hide().empty();
            for (i = 0; i < len; i++) {
                s = this.suggestions[i];
                div = $((me.selectedIndex === i ? '<div class="selected"' : '<div') + ' title="' + s + '">' + f(s, this.data[i], v) + '</div>');
                div.mouseover(mOver(i));
                div.click(mClick(i));
                this.container.append(div);
            }
            this.enabled = true;
            this.container.show();
        },

        processResponse: function (text) {
            var response;
            try {
                response = eval('(' + text + ')');
            } catch (err) { return; }
            if (!$.isArray(response.data)) { response.data = []; }
            if (!this.options.noCache) {
                this.cachedResponse[response.query] = response;
                if (response.suggestions.length === 0) { this.badQueries.push(response.query); }
            }
            if (response.query === this.getQuery(this.currentValue)) {//stop if the query does not equal to the value of client.
                this.suggestions = response.suggestions;
                this.data = response.data;
                this.suggest();
            }
        },

        activate: function (index) {//make the item which has been selected.
            var divs, activeItem;
            divs = this.container.children();
            // Clear previous selection:
            if (this.selectedIndex !== -1 && divs.length > this.selectedIndex) {
                $(divs.get(this.selectedIndex)).removeClass();
            }
            this.selectedIndex = index;
            if (this.selectedIndex !== -1 && divs.length > this.selectedIndex) {
                activeItem = divs.get(this.selectedIndex);
                $(activeItem).addClass('selected');
            }
            return activeItem;
        },

        deactivate: function (div, index) {
            div.className = '';
            if (this.selectedIndex === index) { this.selectedIndex = -1; }
        },

        select: function (i) {
            var selectedValue, f;
            selectedValue = this.suggestions[i];
            if (selectedValue) {
                this.el.val(selectedValue);
                if (this.options.autoSubmit) {
                    f = this.el.parents('form');
                    if (f.length > 0) { f.get(0).submit(); }
                }
                this.ignoreValueChange = true;
                this.hide();
                this.onSelect(i);
            }
        },

        moveUp: function () {
            if (this.selectedIndex === -1) { return; }
            if (this.selectedIndex === 0) {
                this.container.children().get(0).className = '';
                this.selectedIndex = -1;
                this.el.val(this.currentValue);
                return;
            }
            this.adjustScroll(this.selectedIndex - 1);
        },

        moveDown: function () {
            if (this.selectedIndex === (this.suggestions.length - 1)) { return; }
            this.adjustScroll(this.selectedIndex + 1);
        },

        adjustScroll: function (i) {
            var activeItem, offsetTop, upperBound, lowerBound;
            activeItem = this.activate(i);
            offsetTop = activeItem.offsetTop;
            upperBound = this.container.scrollTop();
            lowerBound = upperBound + this.options.maxHeight - 25;
            if (offsetTop < upperBound) {
                this.container.scrollTop(offsetTop);
            } else if (offsetTop > lowerBound) {
                this.container.scrollTop(offsetTop - this.options.maxHeight + 25);
            }
            this.el.val(this.getValue(this.suggestions[i]));
        },

        onSelect: function (i) {
            var me, fn, s, d;
            me = this;
            fn = me.options.onSelect;
            s = me.suggestions[i];
            d = me.data[i];
            me.el.val(me.getValue(s));
            if ($.isFunction(fn)) {
                fn(s, d, me.el);
                var fn2 = me.options.textInEl;
                if ($.isFunction(fn2)) {
                    fn2(me.el.val(), me.el);
                }
            }
        },

        getValue: function (value) {
            var del, currVal, arr, me;
            me = this;
            del = me.options.delimiter;
            if (!del) { return value; }
            currVal = me.currentValue;
            arr = currVal.split(del);
            if (arr.length === 1) { return value; }
            return currVal.substr(0, currVal.length - arr[arr.length - 1].length) + value;
        }

    };

} (jQuery));
