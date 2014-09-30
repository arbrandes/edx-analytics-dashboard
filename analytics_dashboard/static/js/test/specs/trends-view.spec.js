define(['models/course-model', 'views/trends-view'], function(CourseModel, TrendsView) {
    'use strict';

    describe('Trends view', function () {
        it('should assemble data for nvd3', function () {
            var model = new CourseModel(),
                view = new TrendsView({
                    model: model,
                    el: document.createElement('div'),
                    modelAttribute: 'trends',
                    trends: [
                        {
                            key: 'trendA',
                            title: 'A Label',
                            color: '#8DA0CB'
                        },{
                            key: 'trendB',
                            title: 'B Label'
                        }
                    ],
                    title: 'Trend Title',
                    x: {
                        title: 'Title X',
                        // key in the data
                        key: 'date'
                    },
                    y: {
                        title: 'Title Y',
                        key: 'yData'
                    }
                }),
                assembledData,
                actualTrend;

            view.render = jasmine.createSpy('render');
            expect(view.render).not.toHaveBeenCalled();

            // phantomjs doesn't have the bind method on function object
            // (see https://github.com/novus/nvd3/issues/367) and nvd3 will
            // throw an error when it tries to render (when trend data is set).
            try {
                model.set('trends', [{
                    date: '2014-01-01',
                    trendA: 10,
                    trendB: 0
                }, {
                    date: '2014-01-02',
                    trendA: 20,
                    trendB: 1000
                }]);
            } catch (e) {
                if (e.name !== 'TypeError') {
                    throw e;
                }
            }

            // check the data passed to nvd3
            assembledData = view.assembleTrendData();
            expect(assembledData.length).toBe(2);

            actualTrend = assembledData[0];
            // 'key' is the title/label of the of the trend
            expect(actualTrend.key).toBe('A Label');
            expect(actualTrend.values.length).toBe(2);
            expect(actualTrend.values).toContain({date: '2014-01-01', yData: 10});
            expect(actualTrend.values).toContain({date: '2014-01-02', yData: 20});
            expect(actualTrend.color).toBe('#8DA0CB');

            actualTrend = assembledData[1];
            expect(actualTrend.key).toBe('B Label');
            expect(actualTrend.values.length).toBe(2);
            expect(actualTrend.values).toContain({date: '2014-01-01', yData: 0});
            expect(actualTrend.values).toContain({date: '2014-01-02', yData: 1000});
            expect(actualTrend.color).toBeUndefined();
        });

        it('generate a tooltip accessible text for screen readers', function () {
            var view = new TrendsView({
                    model: new CourseModel(),
                    modelAttribute: 'trends'
                }),
                tooltip = view.tooltipTemplate({text: 'This is tooltip text.'});

            expect(tooltip).toBe('<span class="sr-only">This is tooltip text.</span>' +
                '<i class="ico ico-tooltip fa fa-info-circle chart-tooltip" data-toggle="tooltip" data-placement="top" data-track-event="edx.bi.tooltip.displayed" data-track-category="trend" title="This is tooltip text."></i>');
        });
    });
});
