app.controller("positionController", function ($scope, $http) {
  const baseUrl = "http://localhost:8080/api/departments";
  const baseURLP = "http://localhost:8080/api/positions";
  $scope.departments = [];
  $scope.currentDepartmentPage = 1;
  $scope.departmentItemsPerPage = 10;
  $scope.newDepartment = { departmentName: "", isActive: true };
  $scope.selectedDepartment = {};
  $scope.getDepartments = function () {
    const params = {
      departmentName: $scope.searchDepartmentName || "",
      sort: "departmentName",
      direction: "ASC",
    };

    $http
      .get(baseUrl, { params: params })
      .then((response) => {
        $scope.departments = response.data.slice(
          ($scope.currentDepartmentPage - 1) * $scope.departmentItemsPerPage,
          $scope.currentDepartmentPage * $scope.departmentItemsPerPage
        );
        $scope.totalDepartmentPages = Math.ceil(
          response.data.length / $scope.departmentItemsPerPage
        );
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
      });
  };
  $scope.getTotalDepartmentPages = function () {
    // Calculate the total number of pages based on the number of departments and items per page
    return Math.ceil($scope.departments.length / $scope.departmentItemsPerPage);
  };

  $scope.getPaginatedDepartments = function () {
    var start =
      ($scope.currentDepartmentPage - 1) * $scope.departmentItemsPerPage;
    var end = start + $scope.departmentItemsPerPage;
    return $scope.departments.slice(start, end);
  };

  $scope.changeDepartmentPage = function (page) {
    if (page >= 1 && page <= $scope.getTotalDepartmentPages()) {
      $scope.currentDepartmentPage = page;
    }
  };
  $scope.openUpdateModal = function (department) {
    $scope.selectedDepartment = angular.copy(department);

    $("#updateDepartmentModal").modal("show");
  };
  $scope.addDepartment = function () {
    if (!$scope.newDepartment.departmentName) {
      Swal.fire("Lỗi", "Tên phòng ban không được để trống.", "error");
      return;
    }
    if (
      !$scope.newDepartment.departmentName ||
      $scope.newDepartment.departmentName.length < 3
    ) {
      Swal.fire("Lỗi", "Tên phòng ban phải có ít nhất 3 ký tự.", "error");
      return;
    }

    $http
      .post(baseUrl, $scope.newDepartment)
      .then((response) => {
        Swal.fire("Thành công", "Thêm phòng ban thành công.", "success");
        $scope.newDepartment = { departmentName: "", isActive: true };
        $scope.getDepartments();
      })
      .catch((error) => {
        Swal.fire("Lỗi", "Không thể thêm phòng ban.", "error");
      });
  };
  $scope.updateDepartment = function (id) {
    if (!$scope.selectedDepartment.departmentName) {
      Swal.fire("Lỗi", "Tên phòng ban không được để trống.", "error");
      return;
    }
    if (
      !$scope.selectedDepartment.departmentName ||
      $scope.selectedDepartment.departmentName.length < 3
    ) {
      Swal.fire("Lỗi", "Tên phòng ban phải có ít nhất 3 ký tự.", "error");
      return;
    }
    $http
      .put(`${baseUrl}/${id}`, $scope.selectedDepartment)
      .then((response) => {
        Swal.fire("Thành công", "Cập nhật phòng ban thành công.", "success");
        $scope.getDepartments();
        $scope.getActiveDepartments();
        $("#updateDepartmentModal").modal("hide");
        $scope.getDepartments();
      })
      .catch((error) => {
        Swal.fire("Lỗi", "Không thể cập nhật phòng ban.", "error");
      });
  };

  // Hàm cập nhật trạng thái `isActive` của phòng ban
  $scope.updateDepartmentStatus = function (department) {
    const updatedDepartment = {
      departmentName: department.departmentName,
      isActive: department.isActive,
    };

    $http
      .put(`${baseUrl}/${department.id}/toggle-status`, updatedDepartment)
      .then((response) => {
        Swal.fire(
          "Thành công",
          "Trạng thái phòng ban đã được cập nhật.",
          "success"
        );
        $scope.getDepartments();
        $scope.getActiveDepartments();
      })
      .catch((error) => {
        Swal.fire("Lỗi", "Không thể cập nhật trạng thái phòng ban.", "error");
      });
  };
  $scope.getDepartments = function () {
    $http.get(baseUrl).then(function (response) {
      $scope.departments = response.data;
    });
  };

  // Cập nhật lại danh sách sau khi xóa
  $scope.deleteDepartment = function (id) {
    // Hiển thị hộp thoại xác nhận trước khi xóa
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa phòng ban này?",
      text: "Phòng ban sẽ bị xóa vĩnh viễn.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        // Gửi yêu cầu DELETE đến backend
        $http
          .delete(`${baseUrl}/${id}`)
          .then((response) => {
            // Nếu thành công, hiển thị thông báo thành công
            if (response.data.status === "success") {
              Swal.fire("Thành công", response.data.message, "success");

              // Cập nhật lại danh sách phòng ban
              $scope.getDepartments();
            }
          })
          .catch((error) => {
            let errorMessage = "Không thể xóa phòng ban.";

            // Kiểm tra và hiển thị lỗi dựa trên mã trạng thái HTTP
            if (error.status === 409) {
              // Nếu lỗi là do phòng ban đang được tham chiếu
              errorMessage =
                error.data.message ||
                "Không thể xóa phòng ban này vì có chức vụ đang sử dụng.";
            } else if (error.status === 404) {
              // Nếu không tìm thấy phòng ban
              errorMessage =
                error.data.message || "Không tìm thấy phòng ban với id: " + id;
            } else if (error.status === 500) {
              // Lỗi server
              errorMessage =
                error.data.message ||
                "Có lỗi xảy ra trong quá trình xóa phòng ban.";
            }
            Swal.fire("Lỗi", errorMessage, "error");
          });
      }
    });
  };
  // phần chức vụ
  $scope.getActiveDepartments = function () {
    $http
      .get(baseUrl + "/active")
      .then(function (response) {
        $scope.activeDepartments = response.data;
      })
      .catch(function (error) {
        Swal.fire("Lỗi", "Không thể lấy danh sách phòng ban.", "error");
      });
  };
  $scope.positions = [];
  $scope.currentPositionPage = 1;
  $scope.positionItemsPerPage = 5;
  $scope.selectedPosition = {};
  $scope.newPosition = {};
  $scope.positionToUpdate = {};
  $scope.getActiveDepartment2s = function () {
    $http
      .get(baseUrl + "/active")
      .then(function (response) {
        $scope.activeDepartment2s = response.data;
      })
      .catch(function (error) {
        Swal.fire("Lỗi", "Không thể lấy danh sách phòng ban.", "error");
      });
  };
  $scope.getPositions = function () {
    $http
      .get(baseURLP)
      .then((response) => {
        $scope.positions = response.data;
        $scope.totalPositionPages = Math.ceil(
          $scope.positions.length / $scope.positionItemsPerPage
        );
        // Cập nhật lại chức vụ đã phân trang
        $scope.getPaginatedPositions();
      })
      .catch((error) => {
        console.error("Error fetching positions:", error);
      });
  };

  // Hàm tính toán chức vụ theo trang hiện tại
  $scope.getPaginatedPositions = function () {
    var start = ($scope.currentPositionPage - 1) * $scope.positionItemsPerPage;
    var end = start + $scope.positionItemsPerPage;
    $scope.paginatedPositions = $scope.positions.slice(start, end); // Dữ liệu cho trang hiện tại
  };

  // Hàm thay đổi trang
  $scope.changePositionPage = function (page) {
    if (page >= 1 && page <= $scope.totalPositionPages) {
      $scope.currentPositionPage = page;
      $scope.getPaginatedPositions(); // Lấy dữ liệu cho trang mới
    }
  };
  //  thêm
  $scope.addPosition = function () {
    if (
      !$scope.newPosition.positionName ||
      $scope.newPosition.positionName.length < 3
    ) {
      Swal.fire("Lỗi", "Tên chức vụ phải có ít nhất 3 ký tự.", "error");
      return;
    }
    if (!$scope.selectedDepartment) {
      Swal.fire("Lỗi", "Vui lòng chọn phòng ban.", "error");
      return;
    }
    const positionModel = {
      positionName: $scope.newPosition.positionName,
      departmentId: $scope.selectedDepartment,
    };
    $http
      .post(baseURLP, positionModel)
      .then((response) => {
        Swal.fire("Thành công", "Chức vụ đã được thêm thành công.", "success");
        $scope.newPosition.positionName = "";
        $scope.selectedDepartment = "";
        $scope.getPositions();
      })
      .catch((error) => {
        console.error("Lỗi khi thêm chức vụ:", error);
      });
  };

  $scope.deletePosition = function (positionId) {
    // Xác nhận trước khi xóa
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa chức vụ này?",
      text: "Chức vụ sẽ bị xóa vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then((result) => {
      if (result.isConfirmed) {
        // Gửi yêu cầu xóa tới backend
        $http
          .delete(baseURLP + "/" + positionId)
          .then((response) => {
            Swal.fire("Thành công", response.data, "success");
            $scope.getPositions(); // Cập nhật danh sách các chức vụ
          })
          .catch((error) => {
            console.error("Lỗi khi xóa chức vụ:", error);
            if (error.status === 409) {
              Swal.fire(
                "Lỗi",
                "Không thể xóa chức vụ này vì có nhân viên đang sử dụng nó.",
                "error"
              );
            } else if (error.status === 404) {
              Swal.fire("Lỗi", "Không tìm thấy chức vụ này.", "error");
            } else {
              Swal.fire(
                "Lỗi",
                "Có lỗi xảy ra trong quá trình xóa chức vụ.",
                "error"
              );
            }
          });
      }
    });
  };

  // Lấy thông tin chức vụ để cập nhật
  $scope.loadPositionForUpdate = function (positionId) {
    $http
      .get(baseURLP + "/" + positionId)
      .then(function (response) {
        $scope.positionToUpdate = response.data;
        // Mở modal cập nhật
        $("#updatePositionModal").modal("show");
      })
      .catch(function (error) {
        console.error("Lỗi khi lấy thông tin chức vụ:", error);
        Swal.fire("Lỗi", "Không thể lấy thông tin chức vụ.", "error");
      });
  };
  
  $scope.openUpdateModal = function (position) {
    $scope.positionToUpdate = angular.copy(position);
    $("#updatePositionModal").modal("show");
  };

  // Update position
  $scope.updatePosition = function () {
    // Kiểm tra tên chức vụ trước khi gửi
    if (
      !$scope.positionToUpdate.positionName ||
      $scope.positionToUpdate.positionName.length < 3
    ) {
        Swal.fire("Lỗi", "Tên chức vụ phải có ít nhất 3 ký tự.", "error");
        return;
    }

    // Gửi request PUT với dữ liệu cập nhật
    $http
        .put(baseURLP + "/" + $scope.positionToUpdate.id, $scope.positionToUpdate)
        .then((response) => {
            Swal.fire("Thành công", "Chức vụ đã được cập nhật!", "success");
            $scope.getPositions(); // Refresh danh sách chức vụ
            $scope.positionToUpdate = {}; // Xóa form
            $("#updatePositionModal").modal("hide"); // Đóng modal
        })
        .catch((error) => {
            console.error("Lỗi khi cập nhật chức vụ:", error);

            // Kiểm tra lỗi cụ thể từ backend
            if (error.status === 400 && error.data) {
                let errorMessage = "Cập nhật thất bại. Lỗi dữ liệu nhập vào:";
                // Hiển thị từng lỗi cụ thể từ bindingResult
                for (const [field, message] of Object.entries(error.data)) {
                    errorMessage += `\n- ${field}: ${message}`;
                }
                Swal.fire("Lỗi", errorMessage, "error");
            } else if (error.status === 404) {
                Swal.fire("Lỗi", "Không tìm thấy chức vụ với id: " + $scope.positionToUpdate.id, "error");
            } else {
                Swal.fire("Lỗi", "Có lỗi xảy ra khi cập nhật chức vụ!", "error");
            }
        });
};

  $scope.getActiveDepartments();
  $scope.getDepartments();
  $scope.getPositions();
  $scope.getActiveDepartment2s();
});
