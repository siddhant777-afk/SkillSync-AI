import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import { CAREER_GOAL_OPTIONS } from "../../data/registerOptions";

const RegisterStepTwo = ({
  formData,
  errors,
  handleChange,
}) => {
  return (
    <div className="space-y-5">
      <FormSelect
        label="Career Goal (Optional)"
        name="careerGoal"
        value={formData.careerGoal}
        onChange={handleChange}
        options={CAREER_GOAL_OPTIONS}
        placeholder="Select your target career goal (can choose later from web)"
        error={errors.careerGoal}
      />

      <FormInput
        label="GitHub Username"
        name="github"
        value={formData.github}
        onChange={handleChange}
        placeholder="e.g. johndoe"
        error={errors.github}
        autoComplete="off"
      />

      <FormInput
        label="LeetCode Username"
        name="leetcode"
        value={formData.leetcode}
        onChange={handleChange}
        placeholder="e.g. johndoe123"
        error={errors.leetcode}
        autoComplete="off"
      />

      <FormInput
        label="Codeforces Username"
        name="codeforces"
        value={formData.codeforces}
        onChange={handleChange}
        placeholder="e.g. tourist"
        error={errors.codeforces}
        autoComplete="off"
      />

      <FormInput
        label="CodeChef Username"
        name="codechef"
        value={formData.codechef}
        onChange={handleChange}
        placeholder="e.g. johndoe"
        error={errors.codechef}
        autoComplete="off"
      />
    </div>
  );
};

export default RegisterStepTwo;