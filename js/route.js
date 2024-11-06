var app = angular.module('app', ['ngRoute']);

// Cấu hình route và các route cụ thể
app.config(function($routeProvider, $locationProvider) {
    // Định nghĩa các route trong một mảng
    const routes = [
        { path: "/dashboard", template: "dashboard.html", controller: "dashboardController" },
        { path: "/salary-statistics", template: "salary-statistics.html", controller: "salaryStatisticsController" },
        { path: "/attendance-statistics", template: "attendance-statistics.html", controller: "attendanceStatisticsController" },
        { path: "/employees", template: "employees.html", controller: "employeeController" },
        { path: "/positions", template: "positions.html", controller: "positionController" },
        { path: "/departments", template: "departments.html", controller: "departmentController" },
        { path: "/attendance", template: "attendance.html", controller: "attendanceController" },
        { path: "/contracts", template: "contracts.html", controller: "contractController" },
        { path: "/overtime", template: "overtime.html", controller: "overtimeController" },
        { path: "/overtime-schedule", template: "overtime-schedule.html", controller: "overtimeScheduleController" }
    ];

    // Lặp qua mảng để cấu hình các route
    routes.forEach(route => {
        $routeProvider.when(route.path, {
            templateUrl: `${route.template}`,
            controller: route.controller
        });
    });

    // Đường dẫn mặc định
    $routeProvider.otherwise({
        redirectTo: "/dashboard"
    });

    // Cấu hình html5Mode
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});
