Feature: Tạo yêu cầu đăng ký sinh trắc học giọng nói dân sự

  Scenario: Tạo yêu cầu đăng ký mới
    When I access SSO callback with code "123"
    Then I should see dashboard
    When I navigate to menu "Quản lý yêu cầu" -> "Yêu cầu đăng ký/cập nhật/vô hiệu" -> "Đăng ký/cập nhật/vô hiệu đơn lẻ"
    When I click on tab "Dân sự"
    When I click dropdown "Tạo yêu cầu mới" and select "Đăng ký"
    Then I should see text "Tạo mới yêu cầu đăng ký sinh trắc học giọng nói dân sự"

  Scenario: Điền form và submit yêu cầu đăng ký
    When I access SSO callback with code "123"
    Then I should see dashboard
    When I navigate to menu "Quản lý yêu cầu" -> "Yêu cầu đăng ký/cập nhật/vô hiệu" -> "Đăng ký/cập nhật/vô hiệu đơn lẻ"
    When I click on tab "Dân sự"
    When I click dropdown "Tạo yêu cầu mới" and select "Đăng ký"
    Then I should see text "Tạo mới yêu cầu đăng ký sinh trắc học giọng nói dân sự"
    When I fill full name "Trịnh hữu Huy"
    When I fill personal ID "036094006067"
    When I select date of birth "25/04/1994"
    When I select gender "Nam"
    When I select unit option "1"
    When I upload file "src/data/data-training-Dataset 1-1767668223166.wav"
    When I click complete button
    Then I should see success message
    When I navigate to request list page "quan-ly-yeu-cau-sinh-trac/dang-ki-dan-su"
    When I click on tab "Dân sự"
    When I select first option in all filter dropdowns
    Then I should see table with personal ID "036094006067"
