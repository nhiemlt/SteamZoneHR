var app = angular.module('app', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider) {

    const routes = [
        { path: "/dashboard", template: "dashboard.html", controller: "dashboardController" },
        { path: "/salary-statistics", template: "salary-statistics.html", controller: "salaryStatisticsController" },
        { path: "/attendance-statistics", template: "attendance-statistics.html", controller: "attendanceStatisticsController" },
        { path: "/employees", template: "employees.html", controller: "employeeController" },
        { path: "/positions", template: "positions.html", controller: "positionController" },
        { path: "/departments", template: "departments.html", controller: "departmentController" },
        { path: "/contracts", template: "contracts.html", controller: "contractController" },
        { path: "/overtime", template: "overtime.html", controller: "overtimeController" },
        { path: "/overtime-schedule", template: "overtime-schedule.html", controller: "overtimeScheduleController" },
        { path: "/allowances", template: "allowances.html", controller: "allowancesController" },
        { path: "/leave-records", template: "leave-records.html", controller: "leaveRecordController" },
        { path: "/leave-records/:id", template: "leave-records.html", controller: "leaveRecordController" },
    ];

    routes.forEach(route => {
        $routeProvider.when(route.path, {
            templateUrl: route.template,
            controller: route.controller
        });
    });

    $routeProvider.otherwise({
        redirectTo: "/dashboard"
    });

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});