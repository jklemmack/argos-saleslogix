/// <reference path="../../../../../argos-sdk/libraries/ext/ext-core-debug.js"/>
/// <reference path="../../../../../argos-sdk/libraries/sdata/sdata-client-debug"/>
/// <reference path="../../../../../argos-sdk/libraries/Simplate.js"/>
/// <reference path="../../../../../argos-sdk/src/View.js"/>
/// <reference path="../../../../../argos-sdk/src/Edit.js"/>
/// <reference path="../../Format.js"/>

Ext.namespace("Mobile.SalesLogix.Activity");

(function() {
    Mobile.SalesLogix.Activity.CompleteBase = Ext.extend(Sage.Platform.Mobile.Edit, {
        //Localization
        activityInfoText: 'Activity Info',
        asScheduledText: 'as scheduled',
        categoryText: 'category',
        categoryTitleText: 'Activity Category',
        completedText: 'completed date',
        completionText: 'Completion',
        durationText: 'duration',
        carryOverNotesText: 'carry over notes',
        followUpText: 'follow up',
        followUpTitleText: 'Activity Follow Up',
        leaderText: 'leader',
        longNotesText: 'notes',
        longNotesTitleText: 'Notes',
        otherInfoText: 'Other Info',
        priorityText: 'priority',
        priorityTitleText: 'Priority',
        regardingText: 'regarding',
        regardingTitleText: 'Activity Regarding',
        resultText: 'result',
        resultTitleText: 'Result',
        startingText: 'start date',
        timelessText: 'timeless',
        durationValueText: {
            0: 'none',
            15: '15 minutes',
            30: '30 minutes',
            60: '1 hour',
            90: '1.5 hours',
            120: '2 hours'
        },
        followupValueText: {
            'none': 'None',
            'phone call': 'Phone Call',
            'meeting': 'Meeting',
            'to-do': 'To-Do'
        },

        //View Properties
        picklistsByType: {
            'atAppointment': {
                'Category': 'Meeting Category Codes',
                'Description': 'Meeting Regarding',
                'Result': 'Meeting Result Codes'
            },
            'atLiterature': {
                'Description': 'Lit Request Regarding'
            },
            'atPersonal': {
                'Category': 'Meeting Category Codes',
                'Description': 'Personal Activity Regarding',
                'Result': 'Personal Activity Result Codes'
            },
            'atPhoneCall': {
                'Category': 'Phone Call Category Codes',
                'Description': 'Phone Call Regarding',
                'Result': 'Phone Call Result Codes'
            },
            'atToDo': {
                'Category': 'To Do Category Codes',
                'Description': 'To Do Regarding',
                'Result': 'To Do Result Codes'
            },
            'atEMail': {
                'Category': 'E-mail Category Codes',
                'Description': 'E-mail Regarding'
            }
        },       

        entityName: 'Activity', // todo: is this correct?
        querySelect: [
            'AccountId',
            'AccountName',
            'Alarm',
            'AlarmTime',
            'Category',
            'ContactId',
            'ContactName',
            'Duration',
            'LeadId',
            'LeadName',
            'LongNotes',
            'OpportunityId',
            'OpportunityName',
            'Priority',
            'Regarding',
            'Rollover',
            'StartDate',
            'TicketId',
            'TicketNumber',
            'Timeless',
            'Type',
            'UserId'
        ],
        resourceKind: 'activities',

        init: function() {
            Mobile.SalesLogix.Activity.CompleteBase.superclass.init.apply(this, arguments);

            this.fields['Leader'].on('change', this.onLeaderChange, this);
            this.fields['Timeless'].on('change', this.onTimelessChange, this);
            this.fields['AsScheduled'].on('change', this.onAsScheduledChange, this);
            this.fields['Followup'].on('change', this.onFollowupChange, this);
        },
        toggleSelectField: function(field, disable, options) {
            disable === true ? field.disable() : field.enable();
        },
        onTimelessChange: function(value, field) {
            this.toggleSelectField(this.fields['Duration'], value);
        },
        onAsScheduledChange: function(value, field) {
            this.toggleSelectField(this.fields['CompletedDate'], value);
        },
        onFollowupChange: function(value, field) {
            var disable = (value === 'none' || (value && value.key === 'none'));
            this.toggleSelectField(this.fields['CarryOverNotes'], disable);
        },
        formatPicklistForType: function(type, which) {
            return this.picklistsByType[type] && this.picklistsByType[type][which];
        },
        setValues: function(values) {
            Mobile.SalesLogix.Activity.CompleteBase.superclass.setValues.apply(this, arguments);
            this.fields['CompletedDate'].setValue(new Date());
            this.fields['Followup'].setValue('none');
            this.fields['Result'].setValue('Complete');

            this.onFollowupChange('none', this.fields['Followup']);
            this.onAsScheduledChange(false, this.fields['AsScheduled']);
        },
        getValues: function() {
            var values = Mobile.SalesLogix.Activity.CompleteBase.superclass.getValues.apply(this, arguments);
            if (!this.fields['AsScheduled'].getValue()) delete values['CompletedDate'];
            
            return values;
        },
        onLeaderChange: function(value, field) {
            this.fields['UserId'].setValue(value && value['key']);
        },
        formatDurationText: function(val, key, text) {
            return this.durationValueText[key] || text;
        },
        formatFollowupText: function(val, key, text) {
            return this.followupValueText[key] || text;
        },
        createDurationData: function() {
            var list = [];

            for (var duration in this.durationValueText)
            {
                list.push({
                    '$key': duration,
                    '$descriptor': this.durationValueText[duration]
                });
            }

            return {'$resources': list};
        },        
        createFollowupData: function() {
            var list = [];

            for (var followup in this.followupValueText)
            {
                list.push({
                    '$key': followup,
                    '$descriptor': this.followupValueText[followup]
                });
            }

            return {'$resources': list};
        },
        updateCompleted: function(entry) {
            var followup = this.fields['Followup'].getValue();

            if (followup === 'none' || (followup && followup.key === 'none'))
            {
                Mobile.SalesLogix.Activity.CompleteBase.superclass.updateCompleted.apply(this, arguments);
                App.getView('activity_related').show();
                return;
            }

            var view = App.getView(this.followupView);

            entry['Description'] = entry.$descriptor;
            entry['LongNotes'] = this.fields['CarryOverNotes'].getValue() && entry['LongNotes'];

            if (view)
                view.show({
                    entry: entry,
                    insert: true
                });
            else
                Mobile.SalesLogix.Activity.CompleteBase.superclass.updateCompleted.apply(this, arguments);
        },
        createLayout: function() {
            return this.layout || (this.layout = [
                {
                    options: {
                        title: this.activityInfoText,
                        collapsed: false
                    },
                    as: [
                        {
                            name: 'Type',
                            type: 'hidden'
                        },
                        {
                            dependsOn: 'Type',
                            label: this.regardingText,
                            name: 'Description',
                            picklist: this.formatPicklistForType.createDelegate(
                                this, ['Description'], true
                            ),
                            title: this.regardingTitleText,
                            orderBy: 'text asc',
                            type: 'picklist',
                            maxTextLength: 64,
                            validator: Mobile.SalesLogix.Validator.exceedsMaxTextLength
                        },
                        {
                            label: this.startingText,
                            name: 'StartDate',
                            type: 'date',
                            showTimePicker: true,
                            formatString: 'M/d/yyyy h:mm tt',
                            minValue: Date.parse("01 Jan 1900"),
                            validator: [
                                Mobile.SalesLogix.Validator.exists,
                                Mobile.SalesLogix.Validator.isDateInRange
                            ]
                        },
                        {
                            label: this.timelessText,
                            name: 'Timeless',
                            type: 'boolean'
                        },
                        {
                            label: this.durationText,
                            name: 'Duration',
                            type: 'select',
                            view: 'select_list',
                            textRenderer: this.formatDurationText.createDelegate(this),
                            requireSelection: true,
                            valueKeyProperty: false,
                            valueTextProperty: false,
                            data: this.createDurationData(),
                            validator: {
                                fn: function(val, field) {
                                    if (field.isDisabled()) return false;
                                    if (!/^\d+$/.test(val)) return true;
                                },
                                message: "The field '{2}' must have a value."
                            }
                        }
                    ]
                },
                {
                    options: {
                        title: this.completionText,
                        collapsed: false
                    },
                    as: [
                        {
                            label: this.asScheduledText,
                            include: false,
                            name: 'AsScheduled',
                            type: 'boolean'
                        },
                        {
                            label: this.completedText,
                            name: 'CompletedDate',
                            type: 'date',
                            showTimePicker: true,
                            formatString: 'M/d/yyyy h:mm tt',
                            minValue: (new Date(1900, 0, 1)),
                            validator: [
                                Mobile.SalesLogix.Validator.exists,
                                Mobile.SalesLogix.Validator.isDateInRange
                            ]
                        },
                        {
                            dependsOn: 'Type',
                            label: this.resultText,
                            name: 'Result',
                            picklist: this.formatPicklistForType.createDelegate(
                                this, ['Result'], true
                            ),
                            title: this.resultTitleText,
                            orderBy: 'text asc',
                            type: 'picklist',
                            maxTextLength: 64,
                            validator: Mobile.SalesLogix.Validator.exceedsMaxTextLength
                        },
                        {
                            label: this.followUpText,
                            name: 'Followup',
                            type: 'select',
                            view: 'select_list',
                            textRenderer: this.formatFollowupText.createDelegate(this),
                            requireSelection: true,
                            valueKeyProperty: false,
                            valueTextProperty: false,
                            data: this.createFollowupData(),
                            include: false
                        },
                        {
                            label: this.carryOverNotesText,
                            include: false,
                            name: 'CarryOverNotes',
                            type: 'boolean'
                        },
                        {
                            label: this.longNotesText,
                            noteProperty: false,
                            name: 'LongNotes',
                            title: this.longNotesTitleText,
                            type: 'note',
                            view: 'text_edit'
                        }
                    ]
                },
                {
                    options: {
                        title: this.otherInfoText,
                        collapsed: false
                    },
                    as: [
                        {
                            label: this.priorityText,
                            name: 'Priority',
                            picklist: 'Priorities',
                            title: this.priorityTitleText,
                            type: 'picklist',
                            maxTextLength: 64,
                            validator: Mobile.SalesLogix.Validator.exceedsMaxTextLength
                        },
                        {
                            dependsOn: 'Type',
                            label: this.categoryText,
                            name: 'Category',
                            picklist: this.formatPicklistForType.createDelegate(
                                this, ['Category'], true
                            ),
                            orderBy: 'text asc',
                            title: this.activityCategoryTitleText,
                            type: 'picklist',
                            maxTextLength: 64,
                            validator: Mobile.SalesLogix.Validator.exceedsMaxTextLength
                        },
                        {
                            type: 'hidden',
                            name: 'UserId'
                        },
                        {
                            label: this.leaderText,
                            name: 'Leader',
                            include: false,
                            type: 'lookup',
                            textProperty: 'UserInfo',
                            textTemplate: Mobile.SalesLogix.Template.nameLF,
                            requireSelection: true,
                            view: 'user_list'
                        }
                    ]
                }
            ]);
        }
    });     
})();