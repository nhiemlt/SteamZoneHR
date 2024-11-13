var app = angular.module('app', ['ngRoute']);

const firebaseConfig = {
    apiKey: "AIzaSyCGdRzkiryPd3JmpV6vVwcn18bvWgzmu3U",
    authDomain: "steamzonemekonghr.firebaseapp.com",
    projectId: "steamzonemekonghr",
    storageBucket: "steamzonemekonghr.appspot.com",
    messagingSenderId: "458637963796",
    appId: "1:458637963796:web:acd2f4a0bb827753f8ed01",
    measurementId: "G-64CGK99WQ3"
};

firebase.initializeApp(firebaseConfig);

app.config(function ($routeProvider, $locationProvider) {

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
        { path: "/overtime-schedule", template: "overtime-schedule.html", controller: "overtimeScheduleController" },
        { path: "/allowances", template: "allowances.html", controller: "allowancesController" },
        { path: "/leave-records", template: "leave-records.html", controller: "leaveRecordController" }
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

app.service('uploadImageService', function($q) {
    this.uploadImageToFirebase = function(file, oldImageUrl) {
        const deferred = $q.defer();

        const timestamp = Date.now();
        const newFileName = `${timestamp}_${file.name}`;
        const storageRef = firebase.storage().ref().child(`images/${newFileName}`);

        if (oldImageUrl) {
            const oldFileRef = firebase.storage().refFromURL(oldImageUrl);
            oldFileRef.delete().then(() => {
                console.log("Đã xóa ảnh cũ thành công");
            }).catch((error) => {
                console.warn("Không thể xóa ảnh cũ (có thể không tồn tại):", error);
            });
        }

        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed', 
            function(snapshot) {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Đang tải: ' + progress + '%');
            }, 
            function(error) {
                console.error("Lỗi khi tải ảnh lên:", error);
                deferred.reject(error);
            }, 
            function() {
                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                    console.log('URL ảnh mới:', downloadURL);
                    deferred.resolve(downloadURL);
                });
            }
        );

        return deferred.promise;
    };
});